const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);


// using dig becounse dns module in node thown a error when dns is not authoritative

const domain = 'exerciciosresolvidos.net';
const rootNs = '198.41.0.4';

async function lsExample(domain, nsServer) {
    console.log('query', domain, 'in', nsServer, '------------------------------------------')
    const { stdout, stderr } = await exec([ 
            path.resolve(__dirname, 'resolver.sh'),
            domain,
            nsServer
        ].join(' ')
    );

    const response = parseDigOutput(stdout)

    if (getRecordType(response, 'A').find(r => r[0] === (domain + '.'))) {
        
        const nsIpV4 = getRecordType(response, 'A').map(ra => ra[4])
        console.log('end', domain, nsIpV4)
        return nsIpV4
    } else {

        const ns = getRecordType(response,'NS').filter(r => getRecordType(response, 'A').find(ra => ra[0] === r[4] ))[0]
        if (ns) {

            const nsIpV4 = getRecordType(response, 'A').find(ra => ra[0] === ns[4])
            console.log('stdout:', ns[4], nsIpV4[4]);
            return await lsExample(domain, nsIpV4[4])
        } else {
            const nsToResolve = getRecordType(response, 'NS')[0]
            const resolved = await lsExample(nsToResolve[4].replace(/\.$/,''), rootNs);
            return await lsExample(domain, resolved[0])
        }
    }
}

function parseDigOutput(response) {
    return response.split(/\n/)
                    .filter(line => line !== '')
                    .filter(line => (line[0] !== ';'))
                    .map(line => line.split(/[\t|\s]+/))
}

function getRecordType(records, type) {
   return records.filter(r => r.indexOf(type) !== -1)
}

lsExample(domain, rootNs);