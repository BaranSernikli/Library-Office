if (!localStorage.getItem('kullanicilar')) {
    localStorage.setItem('kullanicilar', JSON.stringify([]));
}

const adminBilgileri = {
    eposta: 'baran1@gmail.com',
    sifre: 'admin123',
    tip: 'admin',
    tamAd: 'Baran Sernikli' 
};

if (!localStorage.getItem('sifreSifirlamaTokenlari')) {
    localStorage.setItem('sifreSifirlamaTokenlari', JSON.stringify({}));
}

function kullaniciFormlariniGizle() {
    document.getElementById('user-login-form-area').style.display = 'none';
    document.getElementById('register-form-area').style.display = 'none';
    document.getElementById('forgot-password-form-area').style.display = 'none';
}

function kullaniciGirisFormunuGoster() {
    kullaniciFormlariniGizle();
    document.getElementById('user-login-form-area').style.display = 'block';
    document.getElementById('emailFormContent').style.display = 'block';
    document.getElementById('resetFormContent').style.display = 'none';
    document.getElementById('userLoginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetPasswordForm').reset();
}

function adminGirisFormunuTemizle() {
    document.getElementById('adminLoginForm').reset();
}

function kayitFormunuGoster() {
    kullaniciFormlariniGizle();
    document.getElementById('register-form-area').style.display = 'block';
    document.getElementById('userLoginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetPasswordForm').reset();
}

function sifremiUnuttumFormunuGoster() {
    kullaniciFormlariniGizle();
    document.getElementById('forgot-password-form-area').style.display = 'block';
    document.getElementById('emailFormContent').style.display = 'block';
    document.getElementById('resetFormContent').style.display = 'none';
    document.getElementById('userLoginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetPasswordForm').reset();
}

function toastGoster(mesaj, tip = 'success') {
    const mevcutToastlar = document.querySelectorAll('.toast-container .toast');
    mevcutToastlar.forEach(toast => toast.remove());

    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 start-50 translate-middle-x p-3';
        document.body.appendChild(toastContainer);
    }

    const toastHTML = `
        <div class="toast align-items-center text-white bg-${tip} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${mesaj}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    toastContainer.innerHTML = toastHTML;

    const toastElement = toastContainer.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    toast.show();
}

function kullaniciGirisYap(event) {
    event.preventDefault();
    
    const eposta = document.getElementById('userEmail').value;
    const sifre = document.getElementById('userPassword').value;
    
    if (eposta === adminBilgileri.eposta) {
        toastGoster('Bu hesap admin hesabıdır. Lütfen admin girişini kullanın!', 'danger');
        return false;
    }
    
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    const kullaniciVarMi = kullanicilar.some(k => k.eposta === eposta && k.tip === 'user');
    
    if (!kullaniciVarMi) {
        toastGoster('Sistemde kayıtlı kullanıcı hesabı bulunmamaktadır!', 'danger');
        return false;
    }
    
    const aktifKullanici = kullanicilar.find(k => k.eposta === eposta && k.sifre === sifre && k.tip === 'user');
    
    if (aktifKullanici) {
        localStorage.setItem('aktifKullanici', JSON.stringify({
            id: aktifKullanici.id,
            ad: aktifKullanici.tamAd,
            eposta: aktifKullanici.eposta,
            tip: 'user'
        }));
        
        window.location.href = '../user/index.html';
    } else {
        toastGoster('E-posta veya şifre hatalı!', 'danger');
    }
    
    return false;
}

function adminGirisYap(event) {
    event.preventDefault();
    
    const eposta = document.getElementById('adminEmail').value;
    const sifre = document.getElementById('adminPassword').value;
    
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    const normalKullaniciVarMi = kullanicilar.some(k => k.eposta === eposta);
    
    if (normalKullaniciVarMi) {
        toastGoster('Bu hesap kullanıcı hesabıdır. Lütfen kullanıcı girişini kullanın!', 'danger');
        return false;
    }
    
    if (eposta !== adminBilgileri.eposta) {
        toastGoster('Sistemde kayıtlı admin hesabı bulunmamaktadır!', 'danger');
        return false;
    }
    
    if (adminBilgileri.sifre === sifre) {
        localStorage.setItem('aktifKullanici', JSON.stringify({
            eposta: adminBilgileri.eposta,
            tip: adminBilgileri.tip,
            tamAd: adminBilgileri.tamAd
        }));
        
        window.location.href = '../admin/index.html';
    } else {
        toastGoster('E-posta veya şifre hatalı!', 'danger');
    }
    
    return false;
}

function kayitOl(event) {
    event.preventDefault();
    
    const tamAd = document.getElementById('fullName').value;
    const eposta = document.getElementById('regEmail').value; 
    const sifre = document.getElementById('regPassword').value; 
    const yeniSifreTekrar = document.getElementById('confirmPassword').value;
    
    if (sifre !== yeniSifreTekrar) {
        alert('Şifreler eşleşmiyor!'); 
        return false;
    }
    
    if (sifre.length < 5) {
        alert('Şifre en az 5 karakter olmalıdır!'); 
        return false;
    }
    
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    const epostaZatenKullaniliyor = kullanicilar.some(k => k.eposta === eposta) || (adminBilgileri.eposta === eposta);

    if (epostaZatenKullaniliyor) {
         alert('Bu e-posta adresi zaten kayıtlı!'); 
        return false;
    }
    
    const yeniKullanici = {
        id: Date.now().toString(), 
        tamAd: tamAd,
        eposta: eposta,
        sifre: sifre,
        tip: 'user', 
        olusturmaTarihi: new Date().toISOString()
    };
    
    kullanicilar.push(yeniKullanici);
    localStorage.setItem('kullanicilar', JSON.stringify(kullanicilar));
    
    toastGoster('Kayıt başarılı! Giriş yapabilirsiniz.', 'success'); 
    kullaniciGirisFormunuGoster();
    
    return false;
}

function sifremiUnuttumIstegi(event) {
    event.preventDefault();
    
    const eposta = document.getElementById('forgotEmail').value;
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    const kullanici = kullanicilar.find(k => k.eposta === eposta && k.tip === 'user');
    if (!kullanici) {
        alert('Bu e-posta adresi ile kayıtlı bir kullanıcı hesabı bulunamadı!'); 
        return false;
    }
    
    const sifirlamaTokeni = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const tokenlar = JSON.parse(localStorage.getItem('sifreSifirlamaTokenlari')) || {};
    tokenlar[sifirlamaTokeni] = {
        eposta: eposta,
        suresi: Date.now() + (24 * 60 * 60 * 1000) 
    };
    localStorage.setItem('sifreSifirlamaTokenlari', JSON.stringify(tokenlar));
    
    const sifirlamaUrl = `${window.location.origin}${window.location.pathname}?token=${sifirlamaTokeni}`;
    toastGoster(`Şifre sıfırlama bağlantısı: ${sifirlamaUrl}\n\nNot: Gerçek bir uygulamada bu bağlantı e-posta ile gönderilir.`, 'info'); 
    
    document.getElementById('emailFormContent').style.display = 'none';
    document.getElementById('resetFormContent').style.display = 'block';
    document.getElementById('resetToken').value = sifirlamaTokeni;
    
    return false;
}

function sifreSifirla(event) {
    event.preventDefault();
    
    const tokenDegeri = document.getElementById('resetToken').value;
    const yeniSifre = document.getElementById('newPassword').value;
    const yeniSifreTekrar = document.getElementById('confirmNewPassword').value;
    
    if (yeniSifre !== yeniSifreTekrar) {
        alert('Şifreler eşleşmiyor!'); 
        return false;
    }
    
    if (yeniSifre.length < 6) {
        alert('Şifre en az 6 karakter olmalıdır!'); 
        return false;
    }
    
    const tokenlar = JSON.parse(localStorage.getItem('sifreSifirlamaTokenlari')) || {};
    const tokenVerisi = tokenlar[tokenDegeri];
    
    if (!tokenVerisi || tokenVerisi.suresi < Date.now()) {
        alert('Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş!'); 
        window.history.replaceState({}, document.title, window.location.pathname);
        kullaniciGirisFormunuGoster(); 
        return false;
    }
    
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    const kullaniciIndex = kullanicilar.findIndex(k => k.eposta === tokenVerisi.eposta && k.tip === 'user'); 
    
    if (kullaniciIndex !== -1) {
        kullanicilar[kullaniciIndex].sifre = yeniSifre;
        localStorage.setItem('kullanicilar', JSON.stringify(kullanicilar));
        
        delete tokenlar[tokenDegeri];
        localStorage.setItem('sifreSifirlamaTokenlari', JSON.stringify(tokenlar));
        
        toastGoster('Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.', 'success'); 
        window.history.replaceState({}, document.title, window.location.pathname);
        kullaniciGirisFormunuGoster(); 
    } else {
        alert('Bir hata oluştu! Lütfen tekrar deneyin.'); 
        window.history.replaceState({}, document.title, window.location.pathname);
        kullaniciGirisFormunuGoster(); 
    }
    
    return false;
}

function sifirlamaTokeniKontrolEt() {
    const urlParametreleri = new URLSearchParams(window.location.search);
    const token = urlParametreleri.get('token');
    
    if (token) {
        const tokenlar = JSON.parse(localStorage.getItem('sifreSifirlamaTokenlari')) || {};
        const tokenVerisi = tokenlar[token];
        
        if (tokenVerisi && tokenVerisi.suresi > Date.now()) {
             const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
             const tokenSahibiUser = kullanicilar.some(k => k.eposta === tokenVerisi.eposta && k.tip === 'user');

             if(tokenSahibiUser) {
               sifremiUnuttumFormunuGoster();
               document.getElementById('emailFormContent').style.display = 'none';
               document.getElementById('resetFormContent').style.display = 'block';
               document.getElementById('resetToken').value = token;
             } else {
                 alert('Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş!'); 
                 window.history.replaceState({}, document.title, window.location.pathname);
                 kullaniciGirisFormunuGoster(); 
             }
        } else {
            alert('Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş!'); 
            window.history.replaceState({}, document.title, window.location.pathname);
            kullaniciGirisFormunuGoster(); 
        }
    }
}

function yetkiKontrolEt() {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (aktifKullanici) {
        if (aktifKullanici.tip === 'user') {
            window.location.href = '../user/index.html';
        } else if (aktifKullanici.tip === 'admin') {
            window.location.href = '../admin/index.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    yetkiKontrolEt(); 
    if (!window.location.search.includes('token=')) {
         kullaniciGirisFormunuGoster(); 
    }
    sifirlamaTokeniKontrolEt(); 

    document.getElementById('user-login-tab').addEventListener('click', kullaniciGirisFormunuGoster);
    document.getElementById('admin-login-tab').addEventListener('click', function(){
        kullaniciFormlariniGizle(); 
        adminGirisFormunuTemizle();
    });

    document.getElementById('userLoginForm').onsubmit = kullaniciGirisYap;
    document.getElementById('adminLoginForm').onsubmit = adminGirisYap;
    document.getElementById('registerForm').onsubmit = kayitOl;
    document.getElementById('forgotPasswordForm').onsubmit = sifremiUnuttumIstegi;
    document.getElementById('resetPasswordForm').onsubmit = sifreSifirla;

});