import type { NextApiRequest, NextApiResponse } from 'next'
import type { Inventaire } from '/interfaces'

export default function userHandler(req: NextApiRequest, res: NextApiResponse) {
  const inventaires: Inventaire[] = [{ id: "50", title:"T50", contentDeMoi:"50" }, { id: "51", title:"T51", contentDeMoi:"51"  }, { id: "52", title:"T52", contentDeMoi:"52"  }]

  const {
    query: { id, title, contentDeMoi },
    method,
  } = req

  switch (method) {
    case 'GET':
      // Get data from your database
      console.log(inventaires.length); // 2
      console.log(inventaires[1].id)
      res.status(200).json(inventaires[1])
      break
    case 'PUT':
      // Update or create data in your database
      res.status(200).json({ id, title: name || `User ${id}` })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}