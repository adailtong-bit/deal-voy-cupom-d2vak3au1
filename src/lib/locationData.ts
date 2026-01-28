interface LocationData {
  states: Record<string, string[]>
}

export const LOCATION_DATA: Record<string, LocationData> = {
  Brasil: {
    states: {
      'São Paulo': [
        'São Paulo',
        'Campinas',
        'Santos',
        'Ribeirão Preto',
        'Sorocaba',
        'São José dos Campos',
        'Guarulhos',
        'Osasco',
      ],
      'Rio de Janeiro': [
        'Rio de Janeiro',
        'Niterói',
        'Petrópolis',
        'Cabo Frio',
        'Angra dos Reis',
        'Paraty',
      ],
      'Minas Gerais': [
        'Belo Horizonte',
        'Uberlândia',
        'Ouro Preto',
        'Juiz de Fora',
        'Contagem',
      ],
      Bahia: ['Salvador', 'Porto Seguro', 'Ilhéus', 'Feira de Santana'],
      'Distrito Federal': ['Brasília'],
      'Santa Catarina': ['Florianópolis', 'Balneário Camboriú', 'Joinville'],
      Paraná: ['Curitiba', 'Londrina', 'Foz do Iguaçu'],
    },
  },
  USA: {
    states: {
      Florida: [
        'Orlando',
        'Miami',
        'Tampa',
        'Jacksonville',
        'Key West',
        'Fort Lauderdale',
      ],
      'New York': ['New York City', 'Buffalo', 'Albany', 'Rochester'],
      California: [
        'Los Angeles',
        'San Francisco',
        'San Diego',
        'Sacramento',
        'San Jose',
      ],
      Texas: ['Houston', 'Austin', 'Dallas', 'San Antonio'],
      Nevada: ['Las Vegas', 'Reno', 'Carson City'],
    },
  },
  Portugal: {
    states: {
      Lisboa: ['Lisboa', 'Cascais', 'Sintra', 'Amadora'],
      Porto: ['Porto', 'Vila Nova de Gaia', 'Matosinhos'],
      Algarve: ['Faro', 'Albufeira', 'Lagos', 'Portimão'],
      Madeira: ['Funchal'],
    },
  },
  France: {
    states: {
      'Île-de-France': ['Paris', 'Versailles', 'Boulogne-Billancourt'],
      "Provence-Alpes-Côte d'Azur": [
        'Marseille',
        'Nice',
        'Cannes',
        'Aix-en-Provence',
      ],
      'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne'],
    },
  },
  Germany: {
    states: {
      Bavaria: ['Munich', 'Nuremberg', 'Augsburg'],
      Berlin: ['Berlin'],
      Hamburg: ['Hamburg'],
      Hesse: ['Frankfurt', 'Wiesbaden'],
    },
  },
  Italy: {
    states: {
      Lazio: ['Rome', 'Latina'],
      Lombardy: ['Milan', 'Bergamo', 'Brescia'],
      Veneto: ['Venice', 'Verona', 'Padua'],
      Tuscany: ['Florence', 'Pisa', 'Siena'],
    },
  },
  China: {
    states: {
      Beijing: ['Beijing'],
      Shanghai: ['Shanghai'],
      Guangdong: ['Guangzhou', 'Shenzhen'],
    },
  },
  Japan: {
    states: {
      Tokyo: ['Tokyo', 'Shinjuku', 'Shibuya'],
      Osaka: ['Osaka', 'Sakai'],
      Kyoto: ['Kyoto'],
      Hokkaido: ['Sapporo'],
    },
  },
}

export const COUNTRIES = Object.keys(LOCATION_DATA).sort()
