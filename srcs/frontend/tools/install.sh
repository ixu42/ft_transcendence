#!/bin/sh

# Downloading and installing ModSecurity firewall 
tar -xzvf modsecurity-v3.0.14.tar.gz
rm -rf modsecurity-v3.0.14.tar.gz
cd modsecurity-v3.0.14
./build.sh
./configure
make -j$(nproc)
make install


