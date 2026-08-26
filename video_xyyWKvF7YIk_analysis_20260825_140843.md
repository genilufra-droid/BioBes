The Alpha Business sales module, as demonstrated in the video, follows a structured workflow for registering sales transactions, handling both domestic and export scenarios.

### 1. Menu and List Layout
The sales module is accessed via the **Regjistrime** (Registrations) menu, leading to **Faturë** (Invoice) and then **Shitje** (Sales). The main register view displays a list of existing invoices with columns for:
*   **Numër Dok.**: Document number.
*   **Data**: Date of the transaction.
*   **Përshkrim**: Description (often the invoice type, e.g., "PS" for Sales Point).
*   **Lloji**: Type.
*   **Klienti**: Client name.
*   **Monedha**: Currency (e.g., EUR, LEK).
*   **Vlefta**: Total value.
*   **V.Matur**: Maturity value or status.

### 2. Opening and Registering a Sales Invoice
When a new sales invoice is opened, the registration window is divided into header, body (grid), and footer sections.

**Header Fields:**
*   **Pika e Shitjes**: Sales point selection via a lookup window.
*   **Document Details**: Fields for Document Number, Date, and Serial Number.
*   **Currency & Exchange Rate**: A dropdown for currency (**Monedha**) and a field for the exchange rate (**Kursi**). Clicking the exchange rate field opens a "Kursi i Këmbimit" window to set the rate for the specific date.
*   **Client Information**: Selecting a client code automatically populates the name, current debt (**Detyrimi**), and maturity days.
*   **Workflow Checkboxes**: Options to treat the invoice as a customs sheet (**Fletë Doganore**) or a warehouse document (**Si Dok Magazine**).

**Body (Grid) Columns:**
*   **Artikulli**: Article code (with lookup).
*   **Emërtimi**: Article description.
*   **Njësia**: Unit of measure.
*   **Sasia**: Quantity.
*   **Çmimi**: Unit price.
*   **Çmimi me TVSH**: Price including VAT.
*   **Zb %**: Line-item discount percentage.
*   **Vlefta pa TVSH**: Value before VAT.
*   **TVSH**: VAT amount per line.
*   **Vlefta me TVSH**: Total line value.

### 3. Domestic vs. Export Invoice Layout
*   **Domestic**: Standard invoice registration as described above.
*   **Export**: If the **Fletë Doganore** (Customs Sheet) option is checked, the system prompts for a customs export registration (**Doganime > Export**) after saving. This secondary window includes fields for:
    *   **Vlerësimi i Faturës për Taksat në Doganë**: Customs valuation, including transport, insurance, and other costs.
    *   **Taxes**: Separate sections for taxes where VAT applies and where it does not.
    *   **VAT Calculation**: A checkbox **Me TVSH** calculates VAT based on the sum of the customs value and applicable taxes.

### 4. Warehouse and Currency Handling
*   **Warehouse**: Users can specify a warehouse code (**Magazina**) for the stock exit. If left blank, the system defaults to the warehouse where the initial stock entry for that article was recorded.
*   **Currency**: The system tracks totals in both the **Monedha Bazë** (Base Currency, typically LEK) and the **Monedha e Faturës** (Invoice Currency).

### 5. VAT and Totals
The footer section summarizes the invoice:
*   **VAT**: Calculated per line and totaled. A global **TVSH** field shows the total tax amount.
*   **Discounts**: A section for global discounts (**Me zbritje**) can be applied as a percentage of the total.
*   **Totals**: Displays the grand total, total with discount, and VAT in both currencies.

### 6. Payment, Posting, and Status Actions
*   **Payment Method**: The **Mënyra e Pagesës** dropdown offers options like **Më mirëbesim** (on credit/trust) or **Kesh** (Cash).
*   **Cash Sales**: If "Kesh" is selected, a seller (**Shitësi**) must be specified, and the document is treated as immediately liquidated.
*   **Actions**: The top toolbar includes actions for **Ruaj** (Save), **Mbyll** (Close), **Printo** (Print), and **Kont** (Post/Account). The **Kont** action performs the accounting entries for the document.
*   **Closing**: Upon saving and closing, the document is added to the main register, and the view returns to the filterable list of sales documents. The system confirms successful registration with a pop-up message.