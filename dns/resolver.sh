#!/bin/bash

# echo $1 
# echo $2
DOMAIN='medoabsoluto.com.br'

# echo "QUERY  \n\n $DOMAIN ON A ROOT DNS server ---------------------------------------------------------------"

dig  $1 @$2 A

# cat result.log
# NS=$(cat result.log |  grep IN  | grep NS | awk '{ print $5}' | head -n 1)
# IP=$(cat result.log  | grep $NS | grep -P "IN.*A" | awk '{ print $5}' | head -n 1)
# cat result.log > dns.log

# printf "QUERY\n$DOMAIN IN $NS:$IP\n---------------------------------------------------------------"
# dig  $DOMAIN @${IP} A > result.log
# cat result.log
# NS=$(cat result.log |  grep IN  | grep NS | awk '{ print $5}' | head -n 1)
# IP=$(cat result.log  | grep $NS | grep -P "IN.*A" | awk '{ print $5}' | head -n 1)

# cat result.log >> dns.log

# printf "QUERY\n$DOMAIN IN $NS:$IP\n---------------------------------------------------------------"
# dig  $DOMAIN @${IP} A > result.log
# cat result.log
# NS=$(cat result.log |  grep IN  | grep NS | awk '{ print $5}' | head -n 1)
# IP=$(cat result.log  | grep $NS | grep -P "IN.*A" | awk '{ print $5}' | head -n 1)
# cat result.log >> dns.log
