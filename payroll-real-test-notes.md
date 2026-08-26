# Test real i Pagave

Skedari `001_2026_7_MON.XLS` u lexua nga fleta `Logs` me 77 punonjës dhe 2,482 stampa. Referenca HTML e trajton Logs si hapin qendror që ushqen Listëprezencën dhe dokumentet vijuese. Implementimi aktual bllokohet sepse kërkon lidhje manuale për çdo punonjës të ri dhe hap konfirmim dreke për çdo ditë me dy stampa. Rrjedha e re duhet të krijojë e lidhë punonjësit në grup dhe të zbatojë një politikë të vetme të importit.

Sipas referencës HTML, pas konfirmimit çdo rresht që nuk ekziston krijon punonjës të ri me Nr. Listëpage të pajisjes (ose `AUTO<ID>`), ndërsa lidhja pajisje–punonjës përditësohet në të njëjtin hap. Përputhja paraprake përdor ID-në e pajisjes dhe, si alternativë, përputhjen e emrit.
