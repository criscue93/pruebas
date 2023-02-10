export const getIP = (ip: string): string => {
  const ipAddressArray = ip.split(':');
  const ipAddressUltimo = ipAddressArray.pop();

  let ipAddress = '';
  if (ipAddressUltimo) {
    ipAddress = ipAddressUltimo;
  }

  return ipAddress;
};
