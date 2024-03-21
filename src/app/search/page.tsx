import { Product, productsTable } from "@/db/schema";
import { sql } from "drizzle-orm";

import { redirect } from "next/navigation";

import { db } from "@/db";
import { vectorize } from "@/lib/vectorize";
import { Index } from "@upstash/vector";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export type CoreProducts = Omit<Product, 'createdAt' | 'updatedAt'>
const index = new Index<CoreProducts>();

const Page = async ({ searchParams }: PageProps) => {
  const query =  searchParams.query;

  if(Array.isArray(query) || !query) {
    return redirect('/');
  }

  let products: CoreProducts[] = await db.select()
  .from(productsTable)
  .where(
    sql`to_tsvector('simple', lower(${productsTable.name} || ' ' || ${
      productsTable.description
    })) @@ to_tsquery('simple', lower(${query
      .trim()
      .split(' ')
      .join(' & ')}))`
  )
  .limit(3);

  if(products.length < 3) {
    const vector = await vectorize(query)

    const res = await index.query({
      topK: 5,
      vector,
      includeMetadata: true

    })
   
    const vectorProducts = res.filter((exisitingProduct) => {
      if(products.some((product) => product.id === exisitingProduct.id) || exisitingProduct.score < 0.9) {
        return false
      } else {
        return true
      }
    }).map(({ metadata }) => metadata!)

    products.push(...vectorProducts)
  }

  if(products.length == 0 ) {
    return (
      <div className="text-center py-4 bg-white shadow-md rounded-b-md">
        <X className="mx-auto h-8 w-8 text-gray-400"/>
        <h3 className="mt-2 text-sm font-semibold text-gray-800">
          No Results
        </h3>
        <p className="mt-1 text-sm mx-auto max-w-prose text-gray-500">
          Sorry we couldnt find any matches for{" "} <span className="text-green-600">{query}</span>.
        </p>
      </div>
    )
  }

    
  return <ul className="py-4 divide-y divide-zinc-100 bg-white shadow-md rounded-b-md">
      {products.slice(0, 3).map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
           <li className='mx-auto py-4 px-8 flex space-x-4'>
            <div className="relative flex items-center bg-zinc-100 rounded-lg h-40 w-40">
              <Image loading="eager" fill alt="product-image" src={`/${product.imageId}`}/>
            </div>

            <div className="w-full flex-1 space-y-2 py-1">
              <h1 className="text-lg font-medium text-gray-900">
                {product.name}
              </h1>

              <p className="prose prose-dm text-gray-500 line-clamp-3">
                {product.description}
              </p>
            </div>
              <p className="text-base font-md text-gray-900">
                ${product.price.toFixed(2)}
              </p>
          </li>
        </Link>
      ))}
    </ul>
}

export default Page;