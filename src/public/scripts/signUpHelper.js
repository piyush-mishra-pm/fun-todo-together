console.log('Hello from SignUp Page');
const signupForm = document.getElementById('signup-form');
const feedback = document.getElementById('feedback');
signupForm.addEventListener('submit', signUpCallback);

async function signUpCallback(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    const result = await fetch('/user/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            email,
            password,
        }),
    }).then(res => res.json());

    console.log(result);

    if (result.status === 'ok') {
        feedback.innerHTML='';
        localStorage.setItem('FTT-token', result.token);
    } 
    
    if(result.status==='error') {
        feedback.innerHTML=result.message;
    }
}