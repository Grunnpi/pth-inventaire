export type Inventaire = {
  id: string
  title: string
  contentDeMoi: string
}


export type Evenement = {
  id: string
  titre?: string
  type?: string
  unite?: string
  status?: string
}

export type Utilisateur = {
  id: string
  nom?: string
  mot_de_passe?: string
  role?: string
}

export type SessionUser = {
  user: string
  name: string
  email: string
  image: string
  mystuff: string
  data: {
    token: string
    refreshToken: string
    accessTokenExpires: string
  }
}
