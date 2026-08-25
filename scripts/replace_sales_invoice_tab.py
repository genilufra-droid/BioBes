from pathlib import Path

path = Path('/home/ubuntu/sistemi-genit-cloud/client/src/pages/SalesInvoices.tsx')
source = path.read_text()
start = source.index('<TabsContent value="invoices"')
end = source.index('<TabsContent value="report"', start)
tab = source[start:end]
dialog_start = tab.index('<Dialog open={invoiceOpen}')
dialog_end = tab.index('</Dialog>', dialog_start) + len('</Dialog>')
new_invoice_tab = f'''<TabsContent value="invoices" className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#714b67]">Shitje / Regjistër</p><p className="mt-1 text-sm text-slate-500">Regjistri i faturave të shitjes ndjek strukturën Excel të regjistrit të Blerjeve.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={{() => void exportSalesRegisterToExcel(visibleSalesRegisterRows)}}><Download className="mr-2 h-4 w-4" />Excel</Button><Button type="button" variant="outline" onClick={{() => exportSalesRegisterToPDF(visibleSalesRegisterRows)}}>PDF</Button>{tab[dialog_start:dialog_end]}</div></div><SalesRegisterFilterBar filters={{salesRegisterFilters}} onChange={{setSalesRegisterFilters}} /><SalesInvoiceRegister companyId={{companyId}} rows={{visibleSalesRegisterRows}} search={{salesRegisterSearch}} status={{salesRegisterStatus}} onSearchChange={{setSalesRegisterSearch}} onStatusChange={{setSalesRegisterStatus}} onOpenInvoice={{id => openSalesDocument("invoice", id)}} onOpenActions={{id => setActionsDoc({{ type: "invoice", id }})}} /><SalesRegisterTotals rows={{visibleSalesRegisterRows}} /></TabsContent>'''
# The f-string above uses doubled JSX braces for Python formatting. Restore literal JSX expression braces.
new_invoice_tab = new_invoice_tab.replace('{{', '{').replace('}}', '}')
path.write_text(source[:start] + new_invoice_tab + source[end:])
print(f'replaced {end-start} characters with {len(new_invoice_tab)} characters')
