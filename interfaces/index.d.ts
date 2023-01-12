export type Inventaire = {
  rowid?: string
  id: string
  famille?: string
  type?: string
  nom: string
  imageid?: string
  image_visu?: string
  marquage?: string
  commentaire?: string
  localisation?: string
  etat?: string
  date_etat?: string
  date_arrivee?: string
  origine?: string
  image_url?: string
}

export type Evenement = {
  rowid?: string
  id: string
  titre?: string
  type?: string
  unite?: string
  status?: string
}

export type Utilisateur = {
  rowid?: string
  id: string
  nom?: string
  mot_de_passe?: string
  role?: string
}

export type Image = {
  rowid?: string
  id: string
  nom?: string
  commentaire?: string
  googleId?: string
  url?: string
  visualisation?: string
}
