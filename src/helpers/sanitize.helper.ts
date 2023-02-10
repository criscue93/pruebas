export const sanitizeString = (valor: string): string => {
  let response = valor;
  if (valor) {
    response = `${valor}`;
    response = response
      .normalize('NFD')
      .replace(/[\u0300-\u0302-\u0022-\u0027]/g, '')
      .toUpperCase()
      .trim();
  }
  return response;
};

export const sanitizeStringCodigo = (valor: string): string => {
  let response = valor;
  if (valor) {
    response = `${valor}`;
    response = response
      .normalize('NFD')
      .replace(/[\u0020]/g, '_')
      .toUpperCase()
      .trim();

    response = response.replace(/[\u0300-\u0302-\u0022-\u0027]/g, '');
  }
  return response;
};

export const sanitizeStringLower = (valor: string): string => {
  let response = valor;
  if (valor) {
    response = `${valor}`;
    response = response
      .normalize('NFD')
      .replace(/[\u0300-\u0302-\u0022-\u0027]/g, '')
      .toLowerCase()
      .trim();
  }
  return response;
};

export const sanitizeStringTrim = (valor: string): string => {
  let response = valor;
  if (valor) {
    response = `${valor}`;
    response = response.trim();
  }
  return response;
};

export const noComillasNiEspecialSinNN = (valor: string): string => {
  const limpio = valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f-\u0022-\u0027]/g, '')
    .toUpperCase();
  return limpio;
};
