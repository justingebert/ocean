# Getting started

## Environment Setup

### Firewall

Configure iptables configuration

```

#!/bin/sh
# Alle Regeln aller Chains in Tabelle Filter loeschen
#
iptables -F
iptables -t nat -F
#
# Standart Policy fuer alle Chains DROP
#
iptables -P INPUT DROP
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

#
# Allow only 141.45.x.x
#
iptables -A INPUT -m state --state ESTABLISHED -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -s 141.45.0.0/16 -j ACCEPT

iptables-save > /etc/firewall.conf
#
echo -n "#"      > /etc/network/if-up.d/iptables
echo -n !       >> /etc/network/if-up.d/iptables
echo /bin/sh    >> /etc/network/if-up.d/iptables
echo "iptables-restore < /etc/firewall.conf" >> /etc/network/if-up.d/iptables

chmod +x /etc/network/if-up.d/iptables
```

### Frontend Requirements

Install NodeJS [14.X]

```
# curl -sL https://deb.nodesource.com/setup_14.x | bash -
# apt-get -y install nodejs gcc g++ make
```

Install npm

```
# apt-get instal nodejs npm build-essential
# wget https://www.npmjs.com/install.sh
# chmod +x install.sh
# ./install.sh
```

Clone repository

```bash
$ git clone https://github.com/HTWHub/ocean.git
```

### Backend Requirements

Install JDK package

```
# apt-get install default-jdk -y
```

Download the necessary scala .deb file

```
wget www.scala-lang.org/files/archive/scala-2.13.5.deb
```

Install the Scala .deb file

```
sudo dpkg -i scala*.deb
```

Add necessary repository for sbt

```
echo "deb https://dl.bintray.com/sbt/debian /" | tee -a /etc/apt/sources.list.d/sbt.list
```

Add public key for installation

```
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823
apt-get update
```

Finally install sbt

```
apt-get install sbt -y
```

Once the installation is complete, test to make sure all is working

```
sbt test
```

### Apache

Install apache2 webserver

```
# apt install apache2
```

Check apache2 service status

```
# systemctl status apache2
```

Allow React-Router-DOM to handle routes

```
# a2enmod rewrite
# a2enmod ssl
# systemctl restart apache2
```

Add lines to enable RewriteEngine in `etc/apache2/sites-enabled/000-default.conf`

```
<Directory "/var/www/html">
    RewriteEngine on
    # Don't rewrite files or directories
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    # Rewrite everything else to index.html to allow html5 state links
    RewriteRule ^ index.html [L]
</Directory>
```

Enable HTTPS in `/etc/apache2/sites-enabled/000-default.conf`

```
<VirtualHost *:80>
        RewriteEngine On
        RewriteCond %{HTTPS} off
        RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI}
</VirtualHost>

<VirtualHost *:443>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.
        #ServerName www.example.com
        SSLEngine On
        SSLCertificateFile /home/local/cert/ocean.f4.htw-berlin.de.cert
        SSLCertificateKeyFile /home/local/cert/ocean.f4.htw-berlin.de.key
        SSLCACertificateFile /home/local/cert/cacert-HTW.pem
        ServerAdmin s0558151@htw-berlin.de
        ServerName ocean.f4.htw-berlin.de
        ServerAlias ocean.f4.htw-berlin.de
        DocumentRoot /var/www/html/
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # For most configuration files from conf-available/, which are
        # enabled or disabled at a global level, it is possible to
        # include a line for only one particular virtual host. For example the
        # following line enables the CGI configuration for this host only
        # after it has been globally disabled with "a2disconf".
        #Include conf-available/serve-cgi-bin.conf

<Directory "/var/www/html">
    RewriteEngine on
    # Don't rewrite files or directories
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    # Rewrite everything else to index.html to allow html5 state links
    RewriteRule ^ index.html [L]
</Directory>

</VirtualHost>

```

Get permission for user

```
usermod -aG www-data local
chown -R www-data:www-data /var/www/html
chmod -R 770 /var/www/html
```

### Create a systemd service

Create a systemd service file `nano /etc/systemd/system/backend.service`
```
[Unit]
Description=Backend (Play Framework) service.
After=network.target

[Service]
Type=simple
User=local
WorkingDirectory=/home/local/db1/backend
Environment="APPLICATION_SECRET=""
Environment="JWT_SECRET="
Environment="SLICK_DB_URL="
Environment="SLICK_DB_USER="
Environment="SLICK_DB_PASSWORD="
Environment="HOST_IP="
Environment="PG_CLUSTER_HOSTNAME="
Environment="PG_CLUSTER_PORT="
Environment="PG_CLUSTER_DATABASE="
Environment="PG_CLUSTER_USER="
Environment="PG_CLUSTER_PASSWORD="
Environment="MONGODB_CLUSTER_HOSTNAME="
Environment="MONGODB_CLUSTER_PORT="
Environment="MONGODB_CLUSTER_DATABASE="
Environment="MONGODB_CLUSTER_USER="
Environment="MONGODB_CLUSTER_PASSWORD="


ExecStart=/bin/bash /home/local/ocean/backend/target/universal/backend-1.0/bin/backend -Dlogger.resource=logback.production.xml -Dhttps.port=9443 -Dhttp.port=disabled -Dplay.server.https.keyStore.path='/home/local/cert/keystore.p12' -Dplay.server.https.keyStore.password='change_me' -Dplay.server.https.keyStore.type='pkcs12'

[Install]
WantedBy=multi-user.target
```

Reload all service configurations with `systemctl daemon-reload` and allow the user local to manage the service ` nano /etc/sudoers.d/local`.

```
%local ALL= NOPASSWD: /bin/systemctl start backend
%local ALL= NOPASSWD: /bin/systemctl stop backend
%local ALL= NOPASSWD: /bin/systemctl restart backend
```

Obtain the systemd service status with
```
systemctl status backend
journalctl -u backend
```

### PostgreSQL Cluster

Create the file repository configuration:

```sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'```

Import the repository signing key:

```wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -```

Update the package lists:

```apt-get update```

Install the latest version of PostgreSQL.

```apt-get -y install postgresql-12```

Start the database server using:

```pg_ctlcluster 12 main start```

After installing the PostgreSQL database server by default, it creates a user postgres with role postgres. It also creates a system account with the same name postgres. So to connect to postgres server, login to your system as user postgres and connect the database.

```psql -c "alter user postgres with password 'STRONG_PASSWORD'"```

 Change the Listen Address in `/etc/postgresql/12/main/postgresql.conf`

```listen_addresses = '*'```

Also increase the maximum connections. Each PostgreSQL connection consumes RAM for managing the connection or the client using it. The more connections you have, the more RAM you will be using that could instead be used to run the database.

```max_connections = 400```

Integrate LDAP and generic authentication in file ``

```
host    all             +ldap_role       all                     ldap ldapscheme="ldaps" ldapserver="login-dc-01.login.htw-berlin.de" ldapprefix="cn=" ldapsuffix=", ou=idmusers,dc=login,dc=htw-berlin,dc=de" ldapport=636
host    all             +generic_role    all                     md5

```

Provide a initial database

```create database internal with owner=postgres connection limit = -1;```

Revoke public schema access

```REVOKE CREATE ON SCHEMA public FROM PUBLIC;```


### phpPgAdmin

Install phpPgAdmin

```apt -y install phppgadmin```

Modify `/etc/phppgadmin/config.inc.php:

```
$conf['extra_login_security'] = false;
$conf['owned_only'] = true;
```

Set remote postgres cluster hostname in `/etc/phppgadmin/config.inc.php`

```$conf['servers'][0]['host'] = 'CHANGE_ME';```

Reload Apache web server:

```service apache2 reload```

### Adminer

```
apt -y install php php-common
apt -y install php-cli php-fpm php-json php-pdo php-mysql php-zip php-gd  php-mbstring php-curl php-xml php-pear php-bcmath
apt -y install libapache2-mod-php
a2enmod php7.*
apt-get install php-pgsql
systemctl restart apache2
```


## Development

### Docker Images

This project provides a docker image with PostgreSQL, MySQL, MongoDB and Adminer in the file `backend/docker-compose.yml`.

### Play framework

Runs the app in the development mode.

```sbt run -Dconfig.resource=application.dev.conf```

Runs with production configuraiton.

```sbt run -Dconfig.resource=application.production.conf -Dlogger.resource=logback.production.xml```

Runs the tests
```sbt test```

Builds the app for production
```sbt dist```

# Docker (New)

## Install Docker Engine

Install packages to allow apt to use a repository over HTTPS:

```apt-get install ca-certificates curl gnupg lsb-release```

Add Docker’s official GPG key:
```curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg```

Use the following command to set up the stable repository.

```
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com
 linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Install Docker Engine

```
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io
```

Check the server status of docker

```systemctl status docker```

## Install Docker Compose

Download the current stable release of 

```curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose```

Apply executable permission to the binary

```chmod +x /usr/local/bin/docker-compose```

Test installation

```docker-compose --version```


## Setting up a MongoDB Container

Before creating the compose file, let’s search for the official MongoDB container image using the search command.

```docker search mongodb```

Create a directory called “mongodb” to hold the docker-compose file.

```
mkdir -pv mongodb/database
```

The following `docker-compose.yml` file will be created within the `mongodb` directory.

```
version: "3.8"

services:
  mongodb:
    image: mongo
    container_name: mongodb
    environment:
      - MONGO_INITDB_ROOT_USERNAME:
      - MONGO_INITDB_ROOT_PASSWORD:
    volumes:
      - mongodb-data:/data/db
    ports:
      - 27017:27017
    restart: unless-stopped
```

Start the MongoDB Container as detached background process

```
docker-compose up -d
```


Check the status of the container

```
docker ps -a

```