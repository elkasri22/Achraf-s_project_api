function maskVoucherCode(code, length) {
    let result = '';
    for (let i = 0; i < code.length; i++) {
      if (i % 5 === 0 && i !== 0) {
        result += '-';
      }
      if (i < length) {
        result += code[i];
      } else {
        result += '*';
      }
    }
    return result;
  }
//530EA-*****-*****
//530EA-D1234-*****
//530EA-D1245-6G890
module.exports = maskVoucherCode;
