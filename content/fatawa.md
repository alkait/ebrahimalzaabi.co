---
title: "الفتاوى"
type: "page"
url: "/fatawa/"
identifier: "fatawa"
_build:
  render: true
  list: true
---

## تصفح الفتاوى حسب التصنيف

{{< category-list >}} 

---

## أرسل سؤالك الشرعي

<form id="question-form" style="max-width:400px;margin-top:2em;direction:rtl;text-align:right;">
  <label for="from_name">الاسم:</label><br>
  <input type="text" id="from_name" name="from_name" required style="width:100%;margin-bottom:1em;"><br>
  <label for="from_email">البريد الإلكتروني:</label><br>
  <input type="email" id="from_email" name="from_email" required style="width:100%;margin-bottom:1em;"><br>
  <label for="message">سؤالك:</label><br>
  <textarea id="message" name="message" rows="5" required style="width:100%;margin-bottom:1em;"></textarea><br>
  <button type="submit" style="width:100%;">إرسال</button>
  <div id="form-status" style="margin-top:1em;"></div>
</form>

<script type="text/javascript" src="https://cdn.emailjs.com/dist/email.min.js"></script>
<script type="text/javascript">
(function() {
  emailjs.init("128pV6FLL2BMqgTB2");
})();

document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('question-form');
  var status = document.getElementById('form-status');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    status.textContent = '...جاري الإرسال';
    emailjs.sendForm('service_fcyrk4j', 'template_zo43j1f', form)
      .then(function() {
        status.style.color = 'green';
        status.textContent = 'تم إرسال سؤالك بنجاح. سنرد عليك قريباً.';
        form.reset();
      }, function(error) {
        status.style.color = 'red';
        status.textContent = 'حدث خطأ أثناء الإرسال. الرجاء المحاولة لاحقاً.';
      });
  });
});
</script>
