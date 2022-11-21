# QRmenu_Backend

### ENV variables

| ENV variable   | Development | Production | Note                                          |
| -------------- | ----------- | ---------- | --------------------------------------------- |
| NODE_ENV       | optional    | required   | development/test/production                   |
| HOST           | optional    | required   | developmentServer/testServer/productionServer |
| DOMAIN         | optional    | required   | domain name for admin (FE)                    |
| FILES_PATH     | optional    | required   | relative base path for files                  |
| JWT_SECRET     | required    | required   | server secret for signing jwt tokens          |
| POSTGRESQL_URL | required    | required   | connection string for postgres                |
| EMAIL_PASSWORD | optional    | required   | password for smtp server for user             |
| EMAIL_USER     | optional    | required   | email auth user                               |
| EMAIL_HOST     | optional    | required   | email server host url                         |
| EMAIL_PORT     | optional    | required   | email server port                             |
| EMAIL_FROM     | optional    | required   | The e-mail address of the sender              |

User for test login:
{
email: 'tuser@gmail.com',
password: 'Matfyz123.'
}

### Log files

1.  **INFO- logs all requests**

    -   **_format_**

            DateTime info: url - [METHOD] /request path
            DateTime info: header - "{header values}"
            DateTime info: query - "{query values}"
            DateTime info: body - "{body values}"

    -   **_example_**

            2019-07-10 09:56:32 info: url - [GET] /api/v1/enumerations
            2019-07-10 09:56:32 info: header - "{ 'user-agent': 'PostmanRuntime/7.15.0',\n  accept: '*/*',\n  'cache-control': 'no-cache',\n  connection: 'keep-alive' }"
            2019-07-10 09:56:32 info: query - "{}"
            2019-07-10 09:56:32 info: body - "{}"

2.  **ERROR- logs all errors**

    -   **_format_**

            DateTime error: status code - "error message" - /request path - METHOD - IP ADDRESS
            DateTime error: stack: "full error message"

    -   **_example_**

            2019-07-16 20:52:10 error: 401 - "Používateľské meno alebo heslo je nesprávne" - /api/v1/authorization/login - POST - ::ffff:127.0.0.1
            2019-07-16 20:52:10 error: stack: "'Error: \"Používateľské meno alebo heslo je nesprávne\"\\n    at passport_1.default.authenticate (c:\\\\Users\\\\..."

3.  **EMAIL- logs email statuses**

    -   **_format_**

            {
            	"name":"email",
            	"time":"DateTime",
            	"hostname":"host name",
            	"pid":pid number,
            	"level":event level number,
            	"component":"component",
            	"sid":"sid number",
            	"tnx":"tnx",
            	"msg":"message",
            	"v":logger version number
            }

    -   **_example_**

            {
            	"name":"email",
            	"time":"18-07-2019 15:21:07",
            	"hostname":"DESKTOP-1KTMAP8",
            	"pid":30448,
            	"level":30,
            	"component":"smtp-connection",
            	"sid":"6yxIdnqQA",
            	"tnx":"network",
            	"msg":"Connection closed",
            	"v":0
            }

### TODOs

| Filename | line # | TODO |
| :------- | :----: | :--- |
|          |

-   **NOTE:**
    **TODO must be in a comment (line or block) in its' own line (`some code(); //TODO: do something` is not supported).**
