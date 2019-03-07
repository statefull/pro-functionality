const crypto = require('crypto');

function generatePro(password) {
  const pro = '{ "a": "() => console.log(\'AAA\')", "b": "() => console.log(\'THE PRO FUNCTIONALITY\')" }';

  const algorithm = 'aes-192-cbc';
  
  // Key length is dependent on the algorithm. In this case for aes192, it is
  // 24 bytes (192 bits).
  // Use async `crypto.scrypt()` instead.
  const key = crypto.scryptSync(password, 'salt', 24);
  // Use `crypto.randomBytes()` to generate a random iv instead of the static iv
  // shown here.
  const iv = Buffer.alloc(16, 0); // Initialization vector.

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = '';
  cipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = cipher.read())) {
      encrypted += chunk.toString('hex');
    }
  });

   cipher.on('end', () => {
    console.log('aaaa', encrypted);
    // Prints: some clear text data
  });

  cipher.write(pro);
  cipher.end();

  return encrypted;
}

function decipherPro(password, pro) {  
  return new Promise((resolve, reject) => {
    try {
      const algorithm = 'aes-192-cbc';        
      const key = crypto.scryptSync(password, 'salt', 24);      
      const iv = Buffer.alloc(16, 0); // Initialization vector.

      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      let decrypted = '';

      decipher.on('readable', () => {
        while (null !== (chunk = decipher.read())) {
          decrypted += chunk.toString('utf8');
        }
      });

      decipher.on('end', () => {
        resolve(decrypted);
      });
      
      decipher.write(pro, 'hex');
      decipher.end();
    } catch(e) {
      reject(e);
    }
  });
}


function converter() {
  this.a = () => { console.log('AAA');}
  this.b =  () => {console.log('NOT IMPL'); }

  this.getPro = async (key) => {    
    const pro = await decipherPro(key, '71c5cd920b1febc18650a38632e49a362a49dd493c4651ed523bb565784df228acb277eeede58d554c5705ec4b52665b86ecc49100037ee4cd36b7218aed5d2e725fbc6e552eef208f2cfe47d757a4ea322fa29f5664b81cb164c2fab43bc25c');

    const obj = JSON.parse(pro);
    
    Object.keys(obj).forEach((key) => this[key] = eval(obj[key]));
  } 
}

trial = new converter();

trial.a();
trial.b();

trial.getPro('superpassword')
  .then(() => {
    console.log('!!! YOU ARE PRO');
    trial.a();
    trial.b();
  });
