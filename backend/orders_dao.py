from sql_connection import get_sql_connection

from datetime import datetime

def insert_order_and_details(connection, order):
    cursor = connection.cursor()

    # Insert into orders_table
    order_query = (
        "INSERT INTO orders_table (customer_name, total_cost, phone_number, date_time) "
        "VALUES (%s, %s, %s, %s)"
    )
    phone = order.get('phone_number', '').strip()
    if not phone.isdigit():
        raise ValueError(f"Invalid phone number: {phone}")

    order_data = (
        order['customer_name'],
        float(order['total_cost']),
        int(phone),
        datetime.now()
    )


    cursor.execute(order_query, order_data)
    order_id = cursor.lastrowid

    # Insert into orders_detail
    order_detail_query = (
        "INSERT INTO orders_detail (order_id, product_id, quantity) VALUES (%s, %s, %s)"
    )
    order_items = [(order_id, item['product_id'], item['quantity']) for item in order['items']]
    cursor.executemany(order_detail_query, order_items)

    connection.commit()
    cursor.close()
    return order_id


def get_all_orders(connection):
    cursor = connection.cursor()
    query = "SELECT * FROM orders_table ORDER BY date_time DESC"
    cursor.execute(query)

    orders = []
    for (order_id, customer_name, total_cost, phone_number, date_time) in cursor:
        orders.append({
            'order_id': order_id,
            'customer_name': customer_name,
            'total_cost': total_cost,
            'phone_number': phone_number,
            'date_time': date_time.strftime('%Y-%m-%d %H:%M:%S')
        })

    cursor.close()
    return orders


def get_order_details(connection, order_id):
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM orders_table WHERE order_id = %s", (order_id,)
    )
    order_row = cursor.fetchone()

    if not order_row:
        return None

    cursor.execute(
        "SELECT * FROM orders_detail_with_product_info WHERE order_id = %s", (order_id,)
    )
    product_rows = cursor.fetchall()

    cursor.close()

    return {
        'order_id': order_row['order_id'],
        'customer_name': order_row['customer_name'],
        'phone_number': order_row['phone_number'],
        'date_time': order_row['date_time'].strftime("%Y-%m-%d %H:%M:%S"),
        'products': product_rows
    }

def delete_order(connection, order_id):
    try:
        cursor = connection.cursor()

        # Delete from orders_detail first due to foreign key
        cursor.execute("DELETE FROM orders_detail WHERE order_id = %s", (order_id,))
        
        # Then delete from orders_table
        cursor.execute("DELETE FROM orders_table WHERE order_id = %s", (order_id,))

        connection.commit()
        cursor.close()
        return True
    except Exception as e:
        print("Error deleting order:", e)
        return False



def update_order(connection, order_id, order):
    try:
        cursor = connection.cursor()

        # Update orders_table
        cursor.execute("""
            UPDATE orders_table
            SET customer_name = %s, total_cost = %s, phone_number = %s
            WHERE order_id = %s
        """, (order['customer_name'], float(order['total_cost']), int(order['phone_number']), order_id))

        # Delete old items from orders_detail
        cursor.execute("DELETE FROM orders_detail WHERE order_id = %s", (order_id,))

        # Insert new items
        detail_query = "INSERT INTO orders_detail (order_id, product_id, quantity) VALUES (%s, %s, %s)"
        detail_data = [(order_id, item['product_id'], item['quantity']) for item in order['items']]
        cursor.executemany(detail_query, detail_data)

        connection.commit()
        cursor.close()
        return True
    except Exception as e:
        print("Error updating order:", e)
        return False

# For standalone testing
if __name__ == '__main__':
    from sql_connection import get_sql_connection
    connection = get_sql_connection()
    print(get_all_orders(connection))
