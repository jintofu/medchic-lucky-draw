// ตรวจสอบ URL Parameter ว่าเปิดมาในมุมมองไหน
const urlParams = new URLSearchParams(window.location.search);
const viewMode = urlParams.get('view') || 'admin_login'; // ค่าเริ่มต้นคือหน้า login
const appContainer = document.getElementById('app-container');

// ฟังก์ชันดึงข้อมูลจาก LocalStorage
function getEntries() {
    return JSON.parse(localStorage.getItem('medchic_entries')) || [];
}

// ฟังก์ชันบันทึกข้อมูล
function saveEntry(name, message) {
    const entries = getEntries();
    entries.push({ id: entries.length + 1, name, message, timestamp: new Date().toISOString() });
    localStorage.setItem('medchic_entries', JSON.stringify(entries));
}

// ================= UI RENDERERS =================

function renderUserForm() {
    appContainer.innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <div class="text-center mb-6">
                <i class="fas fa-gift text-4xl text-medchic mb-2"></i>
                <h2 class="text-2xl font-bold">ร่วมสนุกลุ้นรางวัล</h2>
                <p class="text-gray-500 text-sm">กรอกข้อมูลด้านล่างเพื่อลุ้นรับรางวัลจาก MEDCHIC</p>
            </div>
            <form id="userForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">ชื่อ - นามสกุล / ชื่อเล่น</label>
                    <input type="text" id="userName" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-medchic focus:border-medchic" placeholder="ใส่ชื่อของคุณ">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">ข้อความ / ทำไมถึงอยากได้รางวัลนี้</label>
                    <textarea id="userMessage" required rows="3" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-medchic focus:border-medchic" placeholder="พิมพ์ข้อความโดนๆ..."></textarea>
                </div>
                <button type="submit" class="w-full bg-medchic text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">ส่งข้อมูลร่วมสนุก</button>
            </form>
        </div>
    `;

    document.getElementById('userForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('userName').value;
        const message = document.getElementById('userMessage').value;
        saveEntry(name, message);
        
        Swal.fire({
            icon: 'success',
            title: 'ส่งข้อมูลสำเร็จ!',
            text: 'รอลุ้นรางวัลที่หน้าจอหลักได้เลยครับ',
            confirmButtonColor: '#0056b3'
        }).then(() => {
            document.getElementById('userForm').reset();
        });
    });
}

function renderAdminLogin() {
    appContainer.innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
            <h2 class="text-2xl font-bold text-center mb-6">Admin Login</h2>
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" id="username" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg">
                </div>
                <button type="submit" class="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition">Login</button>
            </form>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        
        if (user === 'medchic' && pass === '1234') {
            sessionStorage.setItem('isAdmin', 'true');
            renderAdminDashboard();
        } else {
            Swal.fire('Error', 'Username หรือ Password ไม่ถูกต้อง', 'error');
        }
    });
}

function renderAdminDashboard() {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
        renderAdminLogin();
        return;
    }

    const entries = getEntries();
    const userUrl = window.location.origin + window.location.pathname + "?view=user";

    appContainer.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-lg max-w-5xl w-full flex flex-col md:flex-row gap-6">
            <!-- Sidebar (QR & Controls) -->
            <div class="w-full md:w-1/3 flex flex-col items-center border-r pr-0 md:pr-6">
                <h3 class="font-bold text-lg mb-4">สแกนเพื่อร่วมสนุก</h3>
                <div id="qrcode" class="mb-4 bg-gray-100 p-2 rounded-lg"></div>
                <p class="text-xs text-gray-500 text-center mb-6 break-all">${userUrl}</p>
                
                <div class="w-full space-y-3">
                    <button onclick="copyData()" class="w-full bg-gray-200 text-gray-800 py-2 rounded shadow hover:bg-gray-300 transition"><i class="fas fa-copy"></i> คัดลอกข้อมูลทั้งหมด</button>
                    <div class="border-t pt-3 mt-3">
                        <label class="block text-sm mb-1">จำนวนผู้โชคดี (AI สุ่ม)</label>
                        <input type="number" id="drawCount" value="1" min="1" class="w-full px-3 py-2 border rounded mb-2">
                        <button onclick="randomWithAI()" class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded shadow hover:opacity-90 transition"><i class="fas fa-magic"></i> ให้ AI เลือกผู้ชนะ</button>
                    </div>
                </div>
            </div>

            <!-- Main Table -->
            <div class="w-full md:w-2/3">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">รายชื่อผู้เข้าร่วม (${entries.length})</h2>
                    <button onclick="clearData()" class="text-red-500 text-sm hover:underline">ล้างข้อมูล</button>
                </div>
                <div class="overflow-x-auto h-96 border rounded-lg">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-gray-100 sticky top-0">
                            <tr>
                                <th class="p-3 w-16">ลำดับ</th>
                                <th class="p-3 w-48">ชื่อ</th>
                                <th class="p-3">ข้อความ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${entries.map(e => `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="p-3 font-bold text-gray-500">#${e.id}</td>
                                    <td class="p-3 font-medium">${e.name}</td>
                                    <td class="p-3 text-gray-600 truncate max-w-xs" title="${e.message}">${e.message}</td>
                                </tr>
                            `).join('') || `<tr><td colspan="3" class="p-4 text-center text-gray-400">ยังไม่มีผู้เข้าร่วม</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Generate QR Code pointing exactly to the hosted URL
    setTimeout(() => {
        document.getElementById('qrcode').innerHTML = "";
        new QRCode(document.getElementById("qrcode"), {
            text: userUrl,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
        });
    }, 100);
}

// ================= ADMIN FUNCTIONS =================

window.copyData = function() {
    const entries = getEntries();
    if (entries.length === 0) return Swal.fire('ไม่มีข้อมูล', 'ไม่มีข้อมูลให้คัดลอก', 'warning');
    
    const textData = entries.map(e => `#${e.id} Name: ${e.name} | Message: ${e.message}`).join('\\n');
    navigator.clipboard.writeText(textData).then(() => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'คัดลอกเรียบร้อย นำไปวางในเว็บสุ่มได้เลย', showConfirmButton: false, timer: 2000 });
    });
}

window.clearData = function() {
    Swal.fire({
        title: 'ยืนยันการล้างข้อมูล?',
        text: "ข้อมูลทั้งหมดจะหายไปและไม่สามารถกู้คืนได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('medchic_entries');
            renderAdminDashboard();
        }
    });
}

window.randomWithAI = async function() {
    const entries = getEntries();
    const count = document.getElementById('drawCount').value;
    
    if (entries.length < count) {
        return Swal.fire('ข้อมูลไม่พอ', 'จำนวนผู้เข้าร่วมมีน้อยกว่าจำนวนรางวัล', 'error');
    }

    // ในระบบขึ้น GitHub จริง ไม่ควรฝัง API Key ไว้ในโค้ด เพื่อความปลอดภัย
    // ให้ Admin กรอก API Key เองตอนจะกดสุ่ม หรือใช้ Math.random ปกติไปก่อน
    const { value: apiKey } = await Swal.fire({
        title: 'Gemini AI API Key',
        input: 'password',
        inputLabel: 'เพื่อความปลอดภัย กรุณาใส่ API Key สำหรับการสุ่มผ่าน AI (สามารถข้ามเพื่อใช้ระบบสุ่มปกติได้)',
        inputPlaceholder: 'Enter your API key',
        showCancelButton: true,
        confirmButtonText: 'ใช้ AI สุ่ม',
        cancelButtonText: 'สุ่มปกติแบบไม่ใช้ AI'
    });

    if (!apiKey) {
        // Fallback: Random ปกติ
        let shuffled = entries.sort(() => 0.5 - Math.random());
        let winners = shuffled.slice(0, count);
        let winnerText = winners.map(w => `🎉 ${w.name}`).join('<br>');
        Swal.fire('ผู้โชคดีคือ!', winnerText, 'success');
        return;
    }

    Swal.fire({ title: 'AI กำลังคัดเลือก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `ฉันมีรายชื่อผู้ร่วมสนุกดังนี้: ${JSON.stringify(entries)}. ช่วยสุ่มเลือกผู้ชนะจำนวน ${count} คน โดยพิจารณาจากความสร้างสรรค์ของข้อความ พร้อมเขียนคำอวยพรน่ารักๆ สั้นๆ เป็นภาษาไทยให้ผู้ชนะแต่ละคน ส่งคำตอบกลับมาในรูปแบบอ่านง่าย` }]
                }]
            })
        });
        
        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        
        Swal.fire({
            title: '✨ AI เลือกผู้ชนะแล้ว! ✨',
            html: `<div class="text-left text-sm mt-4 p-4 bg-gray-100 rounded">${resultText.replace(/\\n/g, '<br>')}</div>`,
            width: '600px',
            confirmButtonText: 'ยอดเยี่ยม!'
        });
    } catch (error) {
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ AI ได้ กรุณาตรวจสอบ API Key', 'error');
    }
}

// ================= APP INITIALIZATION =================
if (viewMode === 'user') {
    renderUserForm();
} else {
    // ถ้าหน้า admin จะเช็ค session ว่าเคยล็อกอินรึยังในแท็บนี้
    if (sessionStorage.getItem('isAdmin') === 'true') {
        renderAdminDashboard();
    } else {
        renderAdminLogin();
    }
}
