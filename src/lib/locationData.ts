interface LocationData {
  states: Record<string, string[]>
}

const STATIC_LOCATION_DATA: Record<string, LocationData> = {
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
  Mexico: {
    states: {
      'Mexico City': ['Mexico City'],
      Jalisco: ['Guadalajara'],
      'Nuevo León': ['Monterrey'],
    },
  },
  Spain: {
    states: {
      Madrid: ['Madrid'],
      Catalonia: ['Barcelona'],
      Andalusia: ['Seville', 'Malaga'],
      Valencia: ['Valencia', 'Alicante'],
    },
  },
}

export const getMergedLocationData = (): Record<string, LocationData> => {
  try {
    const saved = localStorage.getItem('system_settings')
    if (saved) {
      const settings = JSON.parse(saved)
      if (settings.fullLocationData) {
        return settings.fullLocationData
      }

      const customLocations = settings.customLocations || {}
      const merged = JSON.parse(JSON.stringify(STATIC_LOCATION_DATA))

      const customRegions = settings.customRegions || []
      customRegions.forEach((r: string) => {
        if (!merged[r]) merged[r] = { states: {} }
      })

      for (const [country, data] of Object.entries(
        customLocations as Record<string, LocationData>,
      )) {
        if (!merged[country]) {
          merged[country] = { states: {} }
        }
        for (const [state, cities] of Object.entries(
          (data as any).states || {},
        )) {
          if (!merged[country].states[state]) {
            merged[country].states[state] = []
          }
          const allCities = [
            ...merged[country].states[state],
            ...(cities as string[]),
          ]
          merged[country].states[state] = Array.from(new Set(allCities)).sort()
        }
      }
      return merged
    }
  } catch (e) {
    console.error('Failed to merge location data', e)
  }
  return JSON.parse(JSON.stringify(STATIC_LOCATION_DATA))
}

export const LOCATION_DATA = getMergedLocationData()

export const COUNTRIES = Object.keys(LOCATION_DATA).sort()

export const REGIONS = Array.from(
  new Set(['Global', ...COUNTRIES, 'Europe', 'North America', 'South America']),
)
