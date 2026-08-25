# Verifikim i topbar-it të kompanisë

`DashboardLayout.tsx` merr kompanitë dhe identifikuesin aktiv nga `useCompany()`, llogarit `activeCompany` sipas ID-së aktive dhe shfaq `activeCompany?.name` në header pranë ikonës së kompanisë. Në pamjen mobile, navigimi ruhet në ikonën menu, ndërsa emri i kompanisë optimizohet vizualisht për ekranet `sm` e sipër.

Kjo lidh topbar-in me kontekstin e kompanisë aktive, jo me një tekst statik.
