const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);


// using dig becounse dns module in node thown a error when dns is not authoritative

const domain = 'medoabsoluto.com.br';
const ns = '198.41.0.4';

async function lsExample(domain, nsServer) {
    console.log('query', domain, 'in', nsServer, '------------------------------------------')
    const { stdout, stderr } = await exec([ 
            path.resolve(__dirname, 'resolver.sh'),
            domain,
            nsServer
        ].join(' ')
    );

    const response = parseDigOutput(stdout)

    if (response['a'].find(r => r[0] === (domain + '.'))) {
        console.log('end', response)
    } else {
        const ns = response['ns'].filter(r => response['a'].find(ra => ra[0] === r[4] ))[0]
        const nsIpV4 = response['a'].find(ra => ra[0] === ns[4])
        console.log('stdout:', ns[4], nsIpV4[4]);
        await lsExample(domain, nsIpV4[4])
    }
    // console.error('stderr:', stderr);
}

function parseDigOutput(response) {
    return response.split(/\n/)
                    .filter(line => line !== '')
                    .filter(line => (line[0] !== ';'))
                    .map(line => line.split(/\t+/))
                    .reduce((m, current) => {
                        console.log(current)
                        m[current[3].toLowerCase()].push(current)
                        return m
                     }, {a: [], aaaa: [], ns: []})
}

lsExample(domain, ns);