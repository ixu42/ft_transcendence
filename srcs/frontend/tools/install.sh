#!/bin/sh

# Install ModSecurity firewall 
tar -xzvf modsecurity-v3.0.14.tar.gz
cd modsecurity-v3.0.14
./build.sh
./configure
make -j$(nproc)
make install
cd /


# Download and install ModSecurity-nginx connector
tar -xzvf nginx-1.27.4.tar.gz
git clone --depth 1 https://github.com/owasp-modsecurity/ModSecurity-nginx
cd nginx-1.27.4
CONF_ARGS=$(nginx -V 2>&1 | grep 'configure arguments:' | cut -d: -f2-)
echo $CONF_ARGS | xargs ./configure --with-compat --add-dynamic-module=/ModSecurity-nginx
make modules
cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

# Configure Modsecurity
mkdir /etc/nginx/modsecurity
cd /etc/nginx/modsecurity
cp /modsecurity-v3.0.14/modsecurity.conf-recommended modsecurity.conf
cp /modsecurity-v3.0.14/unicode.mapping .
git clone --depth 1 https://github.com/coreruleset/coreruleset.git
echo "Include /etc/nginx/modsecurity/coreruleset/crs-setup.conf" >> modsecurity.conf
echo "Include /etc/nginx/modsecurity/coreruleset/rules/*.conf" >> modsecurity.conf


# Remove all installation files 
rm -rf /modsecurity-v3.0.14.tar.gz \
       /modsecurity-v3.0.14 \
       /nginx-1.27.4.tar.gz \
       /ModSecurity-nginx \
       /nginx-1.27.4 \
       /install.sh
