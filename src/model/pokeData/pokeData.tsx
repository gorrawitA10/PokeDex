export interface ElementIcons {
  [key: string]: string;
}

export interface Pokemon {
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
}
export interface Ability {
  name: string;
}

export interface Move {
  name: string;
}
