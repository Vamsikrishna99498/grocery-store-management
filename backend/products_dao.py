from sql_connection import get_sql_connection
def get_next_custom_id(connection):
    cursor = connection.cursor()
    cursor.execute('SELECT MAX(custom_id) FROM products')
    result = cursor.fetchone()[0]
    cursor.close()
    return 1 if result is None else result + 1


def get_all_products(connection):
    cursor = connection.cursor()
    query = ('SELECT * FROM wepons_schema.products;')
    cursor.execute(query)
    response=[]
    for (custom_id,product_id,name,category,description,unit,price,stock_quantity,image_url,rating,is_featured) in cursor:
        response.append (
            {
            'custom_id':custom_id,
            'product_id':product_id,
            'name':name,
            'category':category,
            'description':description,
            'unit':unit,
            'price':price,
            'stock_quantity':stock_quantity,
            'image_url':image_url,
            'rating':rating,
            }
                        )
    return response


def insert_new_product(connection, product):
    cursor = connection.cursor()
    
    # Get the next available custom_id
    custom_id = get_next_custom_id(connection)
    product['custom_id'] = custom_id

    query = (
        'INSERT INTO products '
        '(custom_id, name, category, description, unit, price, stock_quantity, image_url, rating) '
        'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);'
    )

    data = (
        product['custom_id'],
        product['name'],
        product['category'],
        product['description'],
        product['unit'],
        product['price'],
        product['stock_quantity'],
        product['image_url'],
        product['rating'],
    )

    cursor.execute(query, data)
    connection.commit()

    return cursor.lastrowid



def delete_product(connection, product_id):
    cursor = connection.cursor()
    query = 'DELETE FROM products WHERE product_id = %s;'
    cursor.execute(query, (product_id,))
    connection.commit()
    
    
    
def update_product(connection, product_id, product_data):
    cursor = connection.cursor()
    query = """
        UPDATE products SET
            name = %s,
            category = %s,
            description = %s,
            unit = %s,
            price = %s,
            stock_quantity = %s,
            image_url = %s,
            rating = %s
        WHERE product_id = %s
    """
    data = (
        product_data['name'],
        product_data['category'],
        product_data['description'],
        product_data['unit'],
        product_data['price'],
        product_data['stock_quantity'],
        product_data.get('image_url', ''),
        product_data.get('rating', 0),
        product_id
    )
    cursor.execute(query, data)
    connection.commit()


if __name__=='__main__':
    connection=get_sql_connection()
    print(get_all_products(connection))
    