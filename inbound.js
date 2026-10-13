(() => {
  const form = document.querySelector('#form');
  const mainDialog = document.querySelector('#dialog');
  const openForm = document.querySelector('#openForm');

  const countryByPrefix = [
    ['971', 'UAE'], ['966', 'Saudi Arabia'], ['974', 'Qatar'], ['965', 'Kuwait'], ['968', 'Oman'], ['973', 'Bahrain'],
    ['880', 'Bangladesh'], ['880', 'Bangladesh'], ['856', 'Laos'], ['855', 'Cambodia'], ['853', 'Macao'], ['852', 'Hong Kong'],
    ['673', 'Brunei'], ['601', 'Malaysia'], ['598', 'Uruguay'], ['595', 'Paraguay'], ['593', 'Ecuador'], ['591', 'Bolivia'],
    ['507', 'Panama'], ['506', 'Costa Rica'], ['503', 'El Salvador'], ['502', 'Guatemala'], ['501', 'Belize'],
    ['420', 'Czech Republic'], ['421', 'Slovakia'], ['389', 'North Macedonia'], ['386', 'Slovenia'], ['385', 'Croatia'],
    ['380', 'Ukraine'], ['375', 'Belarus'], ['372', 'Estonia'], ['371', 'Latvia'], ['370', 'Lithuania'],
    ['358', 'Finland'], ['357', 'Cyprus'], ['356', 'Malta'], ['355', 'Albania'], ['354', 'Iceland'], ['353', 'Ireland'],
    ['351', 'Portugal'], ['350', 'Gibraltar'], ['359', 'Bulgaria'], ['358', 'Finland'], ['357', 'Cyprus'], ['356', 'Malta'],
    ['349', 'Spain'], ['377', 'Monaco'], ['376', 'Andorra'], ['374', 'Armenia'], ['373', 'Moldova'], ['372', 'Estonia'],
    ['351', 'Portugal'], ['352', 'Luxembourg'], ['353', 'Ireland'], ['354', 'Iceland'], ['355', 'Albania'],
    ['353', 'Ireland'], ['351', 'Portugal'], ['350', 'Gibraltar'], ['346', 'Spain'], ['345', 'Cayman Islands'],
    ['321', 'Netherlands'], ['324', 'Belgium'], ['372', 'Estonia'], ['371', 'Latvia'], ['370', 'Lithuania'],
    ['278', 'South Africa'], ['277', 'South Africa'], ['276', 'South Africa'], ['254', 'Kenya'], ['234', 'Nigeria'],
    ['233', 'Ghana'], ['232', 'Sierra Leone'], ['230', 'Mauritius'], ['227', 'Niger'], ['225', 'Cote d’Ivoire'],
    ['213', 'Algeria'], ['212', 'Morocco'], ['211', 'South Sudan'], ['218', 'Libya'], ['216', 'Tunisia'], ['220', 'Gambia'],
    ['98', 'Iran'], ['97', 'UAE'], ['94', 'Sri Lanka'], ['92', 'Pakistan'], ['91', 'India'], ['86', 'China'],
    ['82', 'South Korea'], ['81', 'Japan'], ['66', 'Thailand'], ['65', 'Singapore'], ['64', 'New Zealand'], ['63', 'Philippines'],
    ['62', 'Indonesia'], ['61', 'Australia'], ['60', 'Malaysia'], ['58', 'Venezuela'], ['55', 'Brazil'], ['54', 'Argentina'], ['52', 'Mexico'],
    ['49', 'Germany'], ['48', 'Poland'], ['47', 'Norway'], ['46', 'Sweden'], ['45', 'Denmark'], ['44', 'United Kingdom'],
    ['43', 'Austria'], ['41', 'Switzerland'], ['40', 'Romania'], ['39', 'Italy'], ['36', 'Hungary'], ['34', 'Spain'],
    ['33', 'France'], ['32', 'Belgium'], ['31', 'Netherlands'], ['30', 'Greece'], ['27', 'South Africa'], ['20', 'Egypt'],
    ['1', 'USA / Canada']
  ].sort((a, b) => b[0].length - a[0].length);

  const style = document.createElement('style');
  style.textContent = `
    .inbound-cta{width:100%;margin:10px 0 18px;padding:14px 16px;border:1.5px solid #e6b118;border-radius:16px;background:#fff;color:#5a4300;font:inherit;font-weight:800;text-align:left;cursor:pointer}
    .inbound-cta small{display:block;margin-top:4px;color:#64746c;font-weight:500}.inbound-sheet{background:#fff;padding:22px;border:0;border-radius:22px;width:min(620px,94vw);box-shadow:0 20px 70px #f3be2c50}.inbound-sheet textarea{width:100%;min-height:160px;box-sizing:border-box;border:1px solid #d8dfd9;border-radius:12px;padding:12px;font:inherit;line-height:1.45}.inbound-tools{display:flex;gap:10px;margin:12px 0}.inbound-tools button{border:0;border-radius:10px;padding:11px 13px;font:inherit;font-weight:700}.inbound-paste{background:#f5c842;color:#2c250c}.inbound-fill{background:#154235;color:#fff}.inbound-cancel{background:#eef1ed;color:#395147}.inbound-status{font-size:13px;color:#64746c;min-height:20px}.inbound-note{font-size:12px;color:#64746c;line-height:1.45}`;
  document.head.append(style);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'inbound-cta';
  button.innerHTML = '📷 截图识别录入 <small>客户主动加你 WA？从 iPhone 截图识别文字，一键带入客户库</small>';
  openForm.after(button);

  const dialog = document.createElement('dialog');
  dialog.innerHTML = `<section class="inbound-sheet"><h2>截图识别录入</h2><p class="hint">在 iPhone 截图里长按文字并复制，或用“140 识别 WA”快捷指令复制后，点下方按钮。</p><textarea id="inbound-text" placeholder="把识别出的 WhatsApp 截图文字粘贴在这里…"></textarea><div class="inbound-tools"><button type="button" class="inbound-paste">读取并粘贴</button><button type="button" class="inbound-fill">识别并带入资料</button><button type="button" class="inbound-cancel">取消</button></div><p class="inbound-status"></p><p class="inbound-note">会识别：电话号码、姓名线索、号码所属国家/地区。识别结果会先打开原来的客户表供你确认，不会直接保存。</p></section>`;
  document.body.append(dialog);

  const text = dialog.querySelector('#inbound-text');
  const status = dialog.querySelector('.inbound-status');
  const tidy = (value) => String(value || '').replace(/[\s().-]/g, '');
  const countryFromPhone = (phone) => countryByPrefix.find(([prefix]) => tidy(phone).replace(/^00/, '').replace(/^\+/, '').startsWith(prefix))?.[1] || '待确认';

  function read(raw) {
    const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const numberMatch = raw.match(/(?:\+|00)?\d[\d\s().-]{6,}\d/);
    const phone = numberMatch ? numberMatch[0].replace(/\s+/g, ' ').trim() : '';
    const named = raw.match(/(?:name|姓名|联系人|contact)\s*[:：-]?\s*([^\n]{2,42})/i)?.[1]?.trim();
    const tagged = raw.match(/\b([A-Za-z]{2})\s*[-–]\s*([A-Za-z][A-Za-z .'-]{1,38})/);
    const fallback = lines.find((line) => /^[A-Za-z][A-Za-z .'-]{1,38}$/.test(line) && !/whatsapp|online|typing|today|yesterday/i.test(line));
    const name = (named || tagged?.[2] || fallback || '').replace(/^(name|姓名|联系人|contact)\s*[:：-]?\s*/i, '').trim();
    return { name, phone, country: (tagged?.[1] || countryFromPhone(phone)).toUpperCase() };
  }

  async function paste() {
    try {
      text.value = await navigator.clipboard.readText();
      status.textContent = text.value ? '已粘贴识别文字，点“识别并带入资料”。' : '剪贴板里没有文字，请手动粘贴。';
    } catch {
      status.textContent = 'Safari 没有允许读取剪贴板，请在输入框长按后选择“粘贴”。';
    }
  }

  function fill() {
    const raw = text.value.trim();
    if (!raw) { status.textContent = '先粘贴截图识别出的文字。'; return; }
    const result = read(raw);
    const set = (name, value) => { const field = form.elements[name]; if (field && value) field.value = value; };
    set('name', result.name);
    set('wa', result.phone);
    set('country', result.country);
    set('stage', '刚加 WA');
    set('note', `来源：客户主动加我（截图识别）\nOCR：${raw.slice(0, 220)}`);
    const remark = document.querySelector('#remark');
    if (remark) remark.textContent = `140.${(result.country || '地区').toUpperCase()}-${result.name || '姓名'}`;
    dialog.close();
    document.querySelector('.sheet h2').textContent = '确认主动加我的客户';
    mainDialog.showModal();
  }

  button.onclick = () => { text.value = ''; status.textContent = ''; dialog.showModal(); };
  dialog.querySelector('.inbound-paste').onclick = paste;
  dialog.querySelector('.inbound-fill').onclick = fill;
  dialog.querySelector('.inbound-cancel').onclick = () => dialog.close();
})();
