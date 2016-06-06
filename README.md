# vCard

vCard (vcf) parser in javascript

## Introduction

vCard Parser parses the vCard (or .vcf file contents)  to a JSON object. Supports multiple vCard entries.

## Usage

Include parser.js file in your project.

    var result = vCardParser.parse(data);

You may check the test.html for more detail and samples.

## Sample Input

    BEGIN:VCARD
    VERSION:4.0
    N:Gump;Forrest;;;
    FN:Forrest Gump
    ORG:Bubba Gump Shrimp Co.
    TITLE:Shrimp Man
    PHOTO;MEDIATYPE=image/gif:http://www.example.com/dir_photos/my_photo.gif
    TEL;TYPE=work,voice;VALUE=uri:tel:+11115551212
    TEL;TYPE=home,voice;VALUE=uri:tel:+14045551212
    ADR;TYPE=work;LABEL="100 Waters Edge\nBaytown, LA 30314\nUnited States of A
     merica":;;100 Waters Edge;Baytown;LA;30314;United States of America
    ADR;TYPE=home;LABEL="42 Plantation St.\nBaytown, LA 30314\nUnited States of
     America":;;42 Plantation St.;Baytown;LA;30314;United States of America
    EMAIL:forrestgump@example.com
    REV:20080424T195243Z
    END:VCARD

## Sample Result

    [
         {
             "Name": {
                 "surname": "Gump",
                 "name": "Forrest",
                 "additionalName": "",
                 "prefix": "",
                 "suffix": ""
             },
             "DisplayName": "Forrest Gump",
             "Organization": "Bubba Gump Shrimp Co.",
             "Title": "Shrimp Man",
             "Photo": "http://www.example.com/dir_photos/my_photo.gif",
             "Telephone": [
                 {
                     "isDefault": false,
                     "valueInfo": {
                         "TYPE": "work,voice",
                         "VALUE": "uri"
                     },
                     "value": "tel:+11115551212"
                 },
                 {
                     "isDefault": false,
                     "valueInfo": {
                         "TYPE": "home,voice",
                         "VALUE": "uri"
                     },
                     "value": "tel:+14045551212"
                 }
             ],
             "Address": [
                 {
                     "isDefault": false,
                     "valueInfo": {
                         "TYPE": "work",
                         "LABEL": "100 Waters Edge\nBaytown, LA 30314\nUnited States of America"
                     },
                     "value": {
                         "PostOfficeBox": "",
                         "Number": "",
                         "Street": "100 Waters Edge",
                         "City": "Baytown",
                         "Region": "LA",
                         "PostalCode": "30314",
                         "Country": "United States of America"
                     }
                 },
                 {
                     "isDefault": false,
                     "valueInfo": {
                         "TYPE": "home",
                         "LABEL": "42 Plantation St.\nBaytown, LA 30314\nUnited States ofAmerica"
                     },
                     "value": {
                         "PostOfficeBox": "",
                         "Number": "",
                         "Street": "42 Plantation St.",
                         "City": "Baytown",
                         "Region": "LA",
                         "PostalCode": "30314",
                         "Country": "United States of America"
                     }
                 }
             ],
             "Email": [
                 {
                     "isDefault": false,
                     "valueInfo": {
                         "TYPE": "home",
                         "LABEL": "42 Plantation St.\nBaytown, LA 30314\nUnited States ofAmerica"
                     },
                     "value": "forrestgump@example.com"
                 }
             ]
         }
     ]
