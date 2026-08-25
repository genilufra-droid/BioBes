# API

API përdor tRPC nën /api/trpc. Kontratat e plota janë në server/routers.ts dhe router files. Procedurat autentike përdorin session context; procedurat administrative kontrollojnë role. Modulet kryesore kanë list/get/create/update/delete ose transition procedures për customer, product, warehouse, purchase, salesInvoice, salesQuotation, salesOrder, delivery, salesReturn, report, banking dhe accounting. Lexo router-in si burim autoritar për input-et dhe gabimet Zod.
