import { Context, TypeInfo, VCard } from "./types";

class VCardParser {
    private fieldPropertyMapping: { [key: string]: string } = {
        "TITLE": "title",
        "TEL": "telephone",
        "FN": "displayName",
        "N": "name",
        "EMAIL": "email",
        "CATEGORIES": "categories",
        "ADR": "address",
        "URL": "url",
        "NOTE": "notes",
        "ORG": "organization",
        "BDAY": "birthday",
        "PHOTO": "photo"
    };

    private fieldParsers: { [key: string]: (context: Context, fieldValue: string, fieldName: string, typeInfo?: TypeInfo[]) => void } = {
        "BEGIN": this.noop,
        "VERSION": this.noop,
        "N": this.structured(['surname', 'name', 'additionalName', 'prefix', 'suffix']),
        "TITLE": this.singleLine,
        "TEL": this.typedLine,
        "EMAIL": this.typedLine,
        "ADR": this.addressLine,
        "NOTE": this.singleLine,
        "NICKNAME": this.commaSeparatedLine,
        "BDAY": this.dateLine,
        "URL": this.singleLine,
        "CATEGORIES": this.commaSeparatedLine,
        "END": this.endCard,
        "FN": this.singleLine,
        "ORG": this.singleLine,
        "UID": this.singleLine,
        "PHOTO": this.singleLine
    };

    public parse(data: string): VCard[] {
        const lines = data
            .replace(/\n\s{1}/g, '')
            .split(/\r\n(?=\S)|\r(?=\S)|\n(?=\S)/);

        const context: Context = {
            info: (desc: string) => console.info(desc),
            error: (err: string) => console.error(err),
            data: lines,
            currentCard: {},
            cards: []
        };

        this.feedData(context);

        return context.cards;
    }

    private feedData(context: Context): void {
        for (let i = 0; i < context.data.length; i++) {
            const line = this.removeWeirdItemPrefix(context.data[i]);
            const pairs = line.split(':');
            let fieldName = pairs[0];
            let fieldTypeInfo: TypeInfo[] | undefined;
            const fieldValue = pairs.slice(1).join(':');

            if (fieldName.indexOf(';') >= 0 && line.indexOf(';') < line.indexOf(':')) {
                const typeInfo = fieldName.split(';');
                fieldName = typeInfo[0];
                fieldTypeInfo = typeInfo.slice(1).map(type => {
                    const info = type.split('=');
                    return {
                        name: info[0]?.toLowerCase() ?? '',
                        value: info[1]?.replace(/"(.*)"/, '$1') ?? ''
                    };
                });
            }

            fieldName = fieldName.toUpperCase();

            const fieldHandler = this.fieldParsers[fieldName];

            if (fieldHandler) {
                fieldHandler(context, fieldValue, this.lookupField(context, fieldName), fieldTypeInfo);
            } else if (fieldName.substring(0, 2) !== 'X-') {
                context.info(`unknown field ${fieldName} with value ${fieldValue}`);
            }
        }
    }

    private lookupField(context: Context, fieldName: string): string {
        const propertyName = this.fieldPropertyMapping[fieldName];

        if (!propertyName && fieldName !== 'BEGIN' && fieldName !== 'END') {
            context.info(`define property name for ${fieldName}`);
            return fieldName;
        }

        return propertyName ?? '';
    }

    private removeWeirdItemPrefix(line: string): string {
        return line.substring(0, 4) === "item" ? line.match(/item\d\.(.*)/)![1] : line;
    }

    private singleLine(context: Context, fieldValue: string, fieldName: string): void {
        fieldValue = fieldValue.replace('\\n', '\n');

        if (context.currentCard[fieldName]) {
            context.currentCard[fieldName] += '\n' + fieldValue;
        } else {
            context.currentCard[fieldName] = fieldValue;
        }
    }

    private typedLine(context: Context, fieldValue: string, fieldName: string, typeInfo?: TypeInfo[], valueFormatter?: (value: string) => any): void {
        let isDefault = false;

        if (typeInfo) {
            typeInfo = typeInfo.filter(type => {
                isDefault = isDefault || type.name === 'PREF';
                return type.name !== 'PREF';
            });

            const typeInfoObj = typeInfo.reduce((p, c) => {
                p[c.name] = c.value;
                return p;
            }, {} as { [key: string]: string });

            context.currentCard[fieldName] = context.currentCard[fieldName] || [];

            context.currentCard[fieldName].push({
                isDefault: isDefault,
                valueInfo: typeInfoObj,
                value: valueFormatter ? valueFormatter(fieldValue) : fieldValue
            });
        }
    }

    private commaSeparatedLine(context: Context, fieldValue: string, fieldName: string): void {
        context.currentCard[fieldName] = fieldValue.split(',');
    }

    private dateLine(context: Context, fieldValue: string, fieldName: string): void {
        fieldValue = fieldValue.length === 16 ? fieldValue.substr(0, 8) : fieldValue;

        let dateValue: Date | null;

        if (fieldValue.length === 8) {
            dateValue = new Date(parseInt(fieldValue.substr(0, 4)), parseInt(fieldValue.substr(4, 2)) - 1, parseInt(fieldValue.substr(6, 2)));
        } else {
            dateValue = new Date(fieldValue);
        }

        if (!dateValue || isNaN(dateValue.getDate())) {
            dateValue = null;
            context.error(`invalid date format ${fieldValue}`);
        }

        context.currentCard[fieldName] = dateValue && dateValue.toJSON();
    }

    private structured(fields: string[]): (context: Context, fieldValue: string, fieldName: string) => void {
        return (context: Context, fieldValue: string, fieldName: string) => {
            const values = fieldValue.split(';');

            context.currentCard[fieldName] = fields.reduce((p, c, i) => {
                p[c] = values[i] || '';
                return p;
            }, {} as { [key: string]: string });
        };
    }

    private addressLine(context: Context, fieldValue: string, fieldName: string, typeInfo?: TypeInfo[]): void {
        this.typedLine(context, fieldValue, fieldName, typeInfo, (value: string) => {
            const names = value.split(';');

            return {
                postOfficeBox: names[0],
                number: names[1],
                street: names[2] || '',
                city: names[3] || '',
                region: names[4] || '',
                postalCode: names[5] || '',
                country: names[6] || ''
            };
        });
    }

    private noop(): void {}

    private endCard(context: Context): void {
        context.cards.push(context.currentCard);
        context.currentCard = {};
    }
}

export default VCardParser;
