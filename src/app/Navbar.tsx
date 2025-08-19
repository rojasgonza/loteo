import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const navigation = [
    { name: 'Insumos', href: '/insumos', },
    { name: 'Proveedores', href: '/proveedores', },
    { name: 'Ingreso de insumos', href: '/lotes_insumos' },
    { name: 'Productos', href: '/productos' },
    { name: 'Produccion', href: '/produccion' },
    { name: 'Producciones', href: '/data' },

]

export default function Example() {
    return (
        <Disclosure as="nav" className="relative bg-gray-800">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        {/* Mobile menu button*/}
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-1 focus:outline-indigo-500">
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-open:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-open:block" />
                        </DisclosureButton>
                    </div>
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex shrink-0 items-center">
                            <a href="/">
                                <div className="flex flex-col items-center leading-tight text-white">
                                    <span className="text-xl font-bold">Las Glorias</span>
                                    <span className="text-xs tracking-wide uppercase">Planta Elaboradora</span>
                                </div>

                            </a>
                        </div>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-3 text-sm font-medium"
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                            </div>
                        </div>
                    </div>

                </div>
            </div>

              <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </Disclosure>
        
    )
}
