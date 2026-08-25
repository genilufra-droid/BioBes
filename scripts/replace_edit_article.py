from pathlib import Path
path = Path('/home/ubuntu/sistemi-genit-cloud/client/src/pages/Products.tsx')
text = path.read_text()
start = text.index('<form id="edit-product-form"')
end = text.index('</form>', start) + len('</form>')
replacement = '''<form id="edit-product-form" onSubmit={handleEditProduct} className="space-y-3 p-3">\n              <AlphaArticleFields key={editingProductId ?? "empty"} categories={categories} units={units} values={editForm} />\n              <div className="flex justify-end gap-2 border-t border-[#c3d0d8] pt-3"><Button type="button" variant="outline" className="h-8 rounded-sm border-[#9fadb7]" onClick={() => setEditingProductId(null)}>Anullo</Button><Button type="submit" className="h-8 rounded-sm bg-[#2b6892]" disabled={updateProduct.isPending || !productBeingEdited}>{updateProduct.isPending ? "Po ruhet..." : "Ruaj ndryshimet"}</Button></div>\n            </form>'''
path.write_text(text[:start] + replacement + text[end:])
