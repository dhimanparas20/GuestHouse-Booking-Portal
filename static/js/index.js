//Calculate Payable amount
var proceed = false
document.addEventListener('DOMContentLoaded', function() {
    const arrivalDateInput = document.getElementById('arrivalDateInput');
    const departureDateInput = document.getElementById('departureDateInput');
    const resultContainer = document.getElementById('result'); // Element to display result

    // Function to calculate number of days
    function calculateDays() {
        const arrivalDateValue = new Date(arrivalDateInput.value);
        const departureDateValue = new Date(departureDateInput.value);

        const timeDifference = departureDateValue.getTime() - arrivalDateValue.getTime();
        const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        if (!isNaN(numberOfDays) && numberOfDays >= 0) {
            proceed = true
            $('#amount').text(numberOfDays*500)
        } else {
            proceed = false
            $('#amount').text("Inavlid range Try again")
        }
    }

    // Event listener for changes in the arrival date
    arrivalDateInput.addEventListener('change', function() {
        calculateDays();
    });

    // Event listener for changes in the departure date
    departureDateInput.addEventListener('change', function() {
        calculateDays();
    });
});


$(document).ready(function() {
    //$('#bookingForm').trigger("reset");
        $('#bookingForm').submit(function(event) {
            // Prevent default form submission
            event.preventDefault();
            console.log(proceed)
            if (proceed==true){
                const formData = new FormData();
                formData.append("name",$('#nameInput').val());
                formData.append("phoneNumber",$('#phoneInput').val());
                formData.append("email",$('#emailinput').val());
                formData.append("arrivalDate",$('#arrivalDateInput').val());
                formData.append("departureDate",$('#departureDateInput').val());
                formData.append("reason",$('#reasonInput').val())

                $.ajax({
                    type: 'POST',
                    url: '/senddetails',
                    data: formData,
                    contentType: false, 
                    processData: false,
                    success: function(response) {
                        if (response['msg']!== false ){
                        redirect(response);
                        }
                    },
                    error: function(error) {
                        console.error('Error sending details:', error);
                    }
                });
            }
            else{
                alert("Invalid date")
            }    
        });   
});

function redirect(res){
    var options = {
        "key": "rzp_test_Lp3nsJIl1z4Upj",
        "amount": amount,
        "currency": "INR",
        "name": "ABVGIET", //your business name
        "description": "Test Transaction",
        "image": "https://abvgiet.ac.in/storage/app/media/abvgiet-logo-new.png",
        "order_id": res['id'],
        //"callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
        // "callback_url": `http://127.0.0.1:5000/verify?paymentid=${response.razorpay_payment_id}&orderid=${response.razorpay_order_id}&signature=${response.razorpay_signature}`,
        "prefill": {
            "name": res['notes']['name'], //your customer's name
            "email":"abc@mail.com",
            "contact":  res['notes']['phone']//Provide the customer's phone number for better conversion rates 
        },
        "notes": {
            "address": "MST Corporate Office"
        },
        "theme": {
            "color": "#eab676"
        },
        "handler": function (response){
            var formData = new FormData();
            amount = res['amount']/100
            formData.append("razorpay_payment_id",response.razorpay_payment_id);
            formData.append("razorpay_order_id",response.razorpay_order_id);
            formData.append("razorpay_signature",response.razorpay_signature);
            formData.append("name",res['notes']['name']);
            formData.append("phone",res['notes']['phone']);
            formData.append("from",res['notes']['from']);
            formData.append("to",res['notes']['to']);
            formData.append("amt",amount);
            formData.append("email",res['notes']['email']);
            const redirectURL = `/getreceipt?razorpay_payment_id=${formData.get("razorpay_payment_id")}&razorpay_order_id=${formData.get("razorpay_order_id")}&razorpay_signature=${formData.get("razorpay_signature")}&name=${formData.get('name')}&phone=${formData.get('phone')}&from=${formData.get('from')}&to=${formData.get('to')}&amt=${formData.get('amt')}&email=${formData.get('email')}`;
            console.log(redirectURL)

            $.ajax({
                type: 'POST',
                url: '/verify',
                data: formData,
                contentType: false, 
                processData: false,
                success: function(response) {
                    console.log(response)
                    if (response['msg']!== false ){
                    
                    console.log(redirectURL)
                    window.location.href= redirectURL
                    }
                },
                error: function(error) {
                    console.error('Error sending details:', error);
                }
            });
        },
        };
    var rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();
}