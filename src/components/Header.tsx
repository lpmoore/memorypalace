import Link from 'next/link';

export default function Header() {
  return (
    <header className='bg-gray-900 text-white p-6 shadow-md flex justify-between items-center'>
      <h1 className='text-3xl font-serif font-bold tracking-wider'>
        <Link href='/'>Memory Palace</Link>
      </h1>
      <nav>
        <Link
          href='/new-memory'
          className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          New Memory
        </Link>
      </nav>
    </header>
  );
}
