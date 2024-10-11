// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { isDomainAvailable } from '../../lib/resources';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ name: 'Domain not provided' });
  }
  const available: boolean = await isDomainAvailable(domain);
  const status: string = available ? 'available' : 'unavailable';
  res.status(200).json({ name: status })
}
