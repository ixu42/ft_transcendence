#!/bin/sh

# Install ModSecurity firewall 
mkdir modsecurity
tar -xzvf modsecurity.tar.gz  -C /modsecurity --strip-components=1
cd modsecurity
./build.sh
./configure
make -j$(nproc)
make install
cd /


# Download and install ModSecurity-nginx connector
git clone --depth 1 https://github.com/owasp-modsecurity/ModSecurity-nginx
mkdir nginx
tar -xzvf nginx.tar.gz  -C /nginx --strip-components=1
cd nginx
CONF_ARGS=$(nginx -V 2>&1 | grep 'configure arguments:' | cut -d: -f2-)
echo $CONF_ARGS | xargs ./configure --with-compat --add-dynamic-module=/ModSecurity-nginx
make modules
cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/


# Configure Modsecurity
mkdir /etc/nginx/modsecurity
cd /etc/nginx/modsecurity
cp /modsecurity/modsecurity.conf-recommended modsecurity.conf
cp /modsecurity/unicode.mapping .
sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/g' modsecurity.conf
git clone --depth 1 https://github.com/coreruleset/coreruleset.git
rm coreruleset/crs-setup.conf.example
echo "Include /etc/nginx/modsecurity/coreruleset/crs-setup.conf" >> modsecurity.conf
echo "Include /etc/nginx/modsecurity/coreruleset/rules/*.conf" >> modsecurity.conf

# Remove all installation files 
rm -rf /modsecurity.tar.gz \
       /modsecurity \
       /nginx.tar.gz \
       /nginx \
       /ModSecurity-nginx \
       /install.sh
