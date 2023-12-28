from flask import Flask, redirect, url_for, render_template,request,make_response,jsonify,session
from flask_restful import Api, Resource
from os import system,path,makedirs
from datetime import datetime
from pyMongo import MongoDB
import razorpay
system("clear")


db = MongoDB("ABVGIET","Bookings")
chargesPerDay = int(500)
id = "rzp_test_Lp3nsJIl1z4Upj"
secret = "sRqxFmuaQ3MrKxVUckqkN4Gh"
SECRET_KEY = "Fr5C0vnbm8gTxcPp4FMCVU3OiXxezedn"

app = Flask(__name__)
api = Api(app)
app.secret_key = SECRET_KEY
app.config['SECRET_KEY'] = SECRET_KEY

#Razor pay 
client = razorpay.Client(auth=(id, secret))

# Configure the session cookie settings
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  # Make sure secure cookies are enabled

# Home Page to show the end User    
class Home(Resource):
    def get(self):
        return make_response(render_template("index.html"))  

class GetDetails(Resource):
    def post(self):
        form_data = request.form.to_dict()
        # Convert date strings to datetime objects
        comedate = datetime.strptime(form_data["arrivalDate"], '%Y-%m-%d')
        leavedate = datetime.strptime(form_data["departureDate"], '%Y-%m-%d')

        # Calculate the difference between the dates
        delta = leavedate - comedate
        num_of_days = delta.days
        amount = chargesPerDay*num_of_days
        
        data = { "amount": amount*100, 
                "currency": "INR", 
                "receipt": f"{form_data['name']}-{form_data['phoneNumber']}-{num_of_days}",
                "notes":{"name":form_data['name'],"phone":form_data['phoneNumber'],"email":form_data['email'],"from":form_data["arrivalDate"],"to":form_data['departureDate'],"reason":form_data['reason']}}
        payment = client.order.create(data=data)
        dbData = {"name":payment['notes']['name'],"contact":payment['notes']['phone'],"email":payment['notes']['email'],"from":payment['notes']['from'],"to":payment['notes']['to'],"reason":payment['notes']['reason'],"amount":(payment['amount']/100),"orderid":payment['id'],"status":False}
        status = db.insert(dbData)
        if status == True:
          return payment  
        return ({"msg":False})      

class Verify(Resource):
    def post(self):
        data = request.form.to_dict()  
        response = client.utility.verify_payment_signature({
        'razorpay_order_id': data["razorpay_order_id"],
        'razorpay_payment_id': data['razorpay_payment_id'],
        'razorpay_signature': data["razorpay_signature"]
        })
        res = db.fetch({"orderid":data['razorpay_order_id']})
        if response == True and res != None:
            db.update({"orderid":data['razorpay_order_id']},{"status":True,"paymentid":data['razorpay_payment_id']})
            receipt = {"Name":data['name'],"Contact":data['phone'],"Email":data['email'],"Amount":data['amt'],"Arrival":data['from'],"Departure":data['to'],"OrderID":data['razorpay_order_id'],"TranxactionID":data['razorpay_payment_id']}
            return receipt
            return make_response(render_template("receipt.html",data=receipt))
        else:
            return ({"msg":False}) 

class GetReceipt(Resource):
    def get(self): 
        data = request.args.to_dict()  
        print(data)
        return make_response(render_template("receipt.html",data=data))     
        
class GetAll(Resource):
    def get(self):
        result = db.fetch()
        return make_response(render_template("all.html",data=result))        
               
api.add_resource(Home, '/')   
api.add_resource(GetDetails, '/senddetails') 
api.add_resource(Verify, '/verify') 
api.add_resource(GetAll, '/seeall') 
api.add_resource(GetReceipt, '/getreceipt')


if __name__ == '__main__':
    app.run(debug=True,port=5000,host="0.0.0.0",threaded=True)