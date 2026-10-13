(() => {
  const clean = (value) => String(value || "").replace(/\n/g, " ").replace(/;/g, ",");
  const vcard = (lead) => [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${clean(lead.remark)}`,
    `N:;${clean(lead.remark)};;;`,
    `TEL;TYPE=CELL:${clean(lead.wa)}`,
    lead.email ? `EMAIL:${clean(lead.email)}` : "",
    lead.company ? `ORG:${clean(lead.company)}` : "",
    lead.need ? `NOTE:${clean(lead.need)}` : "",
    "END:VCARD",
  ].filter(Boolean).join("\r\n");

  function addActions() {
    document.querySelectorAll(".lead").forEach((card) => {
      if (card.querySelector(".card-actions")) return;
      const remark = card.querySelector(".remark")?.textContent;
      const lead = window.leads?.find((item) => item.remark === remark);
      if (!lead) return;
      const actions = document.createElement("div");
      actions.className = "card-actions";
      const contact = document.createElement("a");
      contact.className = "contact-btn";
      contact.textContent = "添加到通讯录";
      contact.href = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard(lead))}`;
      contact.download = `${lead.remark}.vcf`;
      const wa = document.createElement("a");
      wa.className = "wa-btn";
      wa.textContent = "打开 WhatsApp";
      wa.href = `https://wa.me/${String(lead.wa).replace(/[^0-9]/g, "")}`;
      actions.append(contact, wa);
      card.append(actions);
    });
  }

  new MutationObserver(addActions).observe(document.querySelector("#leads"), { childList: true });
  addActions();
})();
