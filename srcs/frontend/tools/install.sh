#!/bin/bash

# Installing ModSecurity firewall 
tar -xzvf modsecurity-v3.0.14.tar.gz
cd modsecurity-v3.0.14
./build.sh
./configure
make -j$(nproc)
make install
cd /

# Downloading and installing ModSecurity-nginx connector
tar -xzvf nginx-1.27.4.tar.gz
git clone https://github.com/owasp-modsecurity/ModSecurity-nginx
cd nginx-1.27.4

# Get configure arguments for nginx
input=$(nginx -V 2>&1 | grep 'configure arguments:' | cut -d: -f2-)
IFS=$'\n' read -d '' -r -a CONF_ARGS < <(echo "$input" | sed 's/ --/\n--/g')
for element in "${CONF_ARGS[@]}"; do
    echo "$element"
done
./configure --with-compat --add-dynamic-module=/ModSecurity-nginx "${CONF_ARGS[@]}"


# # Remove all installation files 
# rm -rf modsecurity-v3.0.14.tar.gz \
#        modsecurity-nginx-v1.0.3.tar.gz \
#        modsecurity-v3.0.14 
      #  modsecurity-nginx-v1.0.3