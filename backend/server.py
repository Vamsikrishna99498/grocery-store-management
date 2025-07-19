from flask import Flask,request,jsonify,render_template,send_from_directory
import products_dao
from sql_connection import get_sql_connection

import orders_dao  
app = Flask(__name__,
            template_folder='/home/vamsi/Documents/vamsi dsa/projects/grocery-store-management/ui/html_1'
            ,static_folder='/home/vamsi/Documents/vamsi dsa/projects/grocery-store-management/static')

@app.route('/js/<path:filename>')
def custom_js(filename):
    return send_from_directory('/home/vamsi/Documents/vamsi dsa/projects/grocery-store-management/ui/js', filename)

connection=get_sql_connection()
@app.route('/')
def home_page():
    return render_template('home.html')

@app.route('/manage-products')
def manage_products():
    return render_template('manage-products.html')

@app.route('/order-details')
def order_details_page():
    return render_template('order-details.html')

@app.route('/new-order')
def new_order_page():
    return render_template('new-order.html')

@app.route('/select-products/')
def select_products_page():
    customer_name = request.args.get('customer_name')
    phone_number = request.args.get('phone_number')
    return render_template('select_products.html',customer_name=customer_name,phone_number=phone_number)




@app.route('/getproducts',methods=['GET'])
def get_products():
    products=products_dao.get_all_products(connection)
    response=jsonify(products)
    
    response.headers.add('Access-Control-Allow-Origin','*')
    return response

@app.route('/delete-product/<int:product_id>', methods=['DELETE'])
def delete_product_api(product_id):
    products_dao.delete_product(connection, product_id)
    return jsonify({'message': 'Product deleted successfully'})


@app.route('/addproduct', methods=['POST'])
def add_product():
    request_payload = request.get_json()  # ✅ Get JSON body
    print("Received payload:", request_payload)  
    product_id = products_dao.insert_new_product(connection, request_payload)
    response = jsonify({'success': True, 'product_id': product_id})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/updateproduct/<int:product_id>', methods=['POST'])
def update_product(product_id):
    data = request.get_json()
    print("Updating product:", product_id, data)  # Just log here
    products_dao.update_product(connection, product_id, data)
    return jsonify({'success': True})  # Then return separately

"--- orders---"
@app.route('/getorders', methods=['GET'])
def get_orders():
    orders = orders_dao.get_all_orders(connection)
    return jsonify(orders)

@app.route('/addorder', methods=['POST'])
def add_order():
    order_data = request.get_json()
    order_id = orders_dao.insert_order_and_details(connection, order_data)
    return jsonify({'success': True, 'order_id': order_id})

@app.route('/order-info/<int:order_id>')
def order_info(order_id):
    order = orders_dao.get_order_details(connection, order_id)
    if not order:
        return jsonify({'success': False})
    return jsonify({'success': True, **order})

@app.route('/order-view')
def order_view_page():
    return render_template('order_view.html')

@app.route('/delete-order/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    result = orders_dao.delete_order(connection, order_id)
    if result:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False}), 500

@app.route('/update-order/<int:order_id>', methods=['POST'])
def update_order(order_id):
    order_data = request.get_json()
    success = orders_dao.update_order(connection, order_id, order_data)
    return jsonify({'success': success})



if __name__=='__main__':
    print('strating flask server')
    app.run(port=5000,debug=True)