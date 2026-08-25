from pathlib import Path
path = Path('/home/ubuntu/sistemi-genit-cloud/client/src/pages/Products.tsx')
text = path.read_text()
text = text.replace('import { getOpenProductId } from "@/lib/productActions";', 'import { getOpenProductId } from "@/lib/productActions";\nimport AlphaArticleFields from "@/components/AlphaArticleFields";')
start = text.index('<form id="new-product-form"')
end = text.index('</form>', start) + len('</form>')
replacement = '''<form id="new-product-form" onSubmit={handleAddProduct} className="space-y-3 p-3">\n              <AlphaArticleFields categories={categories} units={units} />\n              <div className="flex justify-end gap-2 border-t border-[#c3d0d8] pt-3"><Button type="button" variant="outline" className="h-8 rounded-sm border-[#9fadb7]" onClick={() => setNewProductOpen(false)}>Anullo</Button><Button type="submit" className="h-8 rounded-sm bg-[#2b6892]" disabled={createProduct.isPending}>{createProduct.isPending ? "Po ruhet..." : "Ruaj dhe Mbyll"}</Button></div>\n            </form>'''
text = text[:start] + replacement + text[end:]
path.write_text(text)
