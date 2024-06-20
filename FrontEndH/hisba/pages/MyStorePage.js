import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar, FaEdit, FaTrash, FaSave, FaPlus, FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from '../styles/MyStorePage.module.css';
import { useSession } from 'next-auth/react';
import Modal from 'react-modal';
import withAuth from '../components/withAuth';

const MyStorePage = () => {
  const { data: session } = useSession();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    quantity: ''
  });
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [storeEditModalIsOpen, setStoreEditModalIsOpen] = useState(false);
  const [deleteConfirmModalIsOpen, setDeleteConfirmModalIsOpen] = useState(false);
  const [coverConfirmModalIsOpen, setCoverConfirmModalIsOpen] = useState(false);

  const [editingStore, setEditingStore] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (session?.user) {
      axios.get(`http://localhost:8000/api/stores/user/`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        }
      })
      .then(res => setStore(res.data))
      .catch(err => console.error('Error fetching store details:', err));
    }
  }, [session]);

  useEffect(() => {
    if (store?.id) {
      axios.get(`http://localhost:8000/api/products/?store=${store.id}`)
        .then(res => setProducts(res.data))
        .catch(err => console.error('Error fetching products:', err));
    }
  }, [store]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('quantity', newProduct.quantity);
    formData.append('image', newProduct.image);

    axios.post('http://localhost:8000/api/products/create/', formData, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      setProducts([...products, res.data]);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        image: '',
        quantity: ''
      });
      setModalIsOpen(false);
    })
    .catch(err => console.error('Error adding product:', err));
  };

  const handleProductEdit = (product) => {
    setEditingProduct(product);
  };

  const handleProductUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('description', editingProduct.description);
    formData.append('price', editingProduct.price);
    formData.append('quantity', editingProduct.quantity);

    if (editingProduct.image instanceof File) {
      formData.append('image', editingProduct.image);
    }

    axios.patch(`http://localhost:8000/api/products/update/${editingProduct.id}/`, formData, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      setProducts(products.map(product => product.id === editingProduct.id ? res.data : product));
      setEditingProduct(null);
    })
    .catch(err => console.error('Error updating product:', err));
  };

  const handleProductDelete = (productId) => {
    axios.delete(`http://localhost:8000/api/products/delete/${productId}/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`
      }
    })
    .then(() => setProducts(products.filter(product => product.id !== productId)))
    .catch(err => console.error('Error deleting product:', err));
  };

  const handleCoverImageChange = (e) => {
    setNewCoverImage(e.target.files[0]);
  };

  const handleCoverImageSubmit = () => {
    const formData = new FormData();
    formData.append('cover_image', newCoverImage);

    axios.patch(`http://localhost:8000/api/stores/update/${store.id}/`, formData, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      setStore(res.data);
      setCoverConfirmModalIsOpen(false);
    })
    .catch(err => console.error('Error updating cover image:', err));
  };

  const openDeleteConfirmModal = (product) => {
    setEditingProduct(product);
    setDeleteConfirmModalIsOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmModalIsOpen(false);
    setEditingProduct(null);
  };

  const openCoverConfirmModal = () => {
    setCoverConfirmModalIsOpen(true);
  };

  const closeCoverConfirmModal = () => {
    setCoverConfirmModalIsOpen(false);
  };

  const openStoreEditModal = () => {
    setEditingStore({
      name: store.name,
      address: store.address,
      phone: store.phone
    });
    setStoreEditModalIsOpen(true);
  };

  const closeStoreEditModal = () => {
    setStoreEditModalIsOpen(false);
  };

  const handleStoreEditChange = (e) => {
    const { name, value } = e.target;
    setEditingStore({ ...editingStore, [name]: value });
  };

  const handleStoreUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editingStore.name);
    formData.append('address', editingStore.address);
    formData.append('phone', editingStore.phone);

    axios.patch(`http://localhost:8000/api/stores/update/${store.id}/`, formData, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      setStore(res.data);
      closeStoreEditModal();
    })
    .catch(err => console.error('Error updating store details:', err));
  };

  return (
    <div className={styles.storeContainer}>
      <motion.div 
        className={styles.storeHeader}
        style={{ backgroundImage: `url(${store?.cover_image || '/default-store.jpg'})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div className={styles.coverContent}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.h1 
            className={styles.storeName}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 100 }}
          >
            {store?.name}
          </motion.h1>
          <p className={styles.storeType}>{store?.store_type}</p>
          <p className={styles.storeType}>Address: {store?.address}</p>
          <p className={styles.storePhone}>Phone: {store?.phone}</p>
          <div className={styles.storeRating}>
            {[...Array(store?.average_rating)].map((_, i) => (
              <FaStar key={i} className={styles.starIcon} />
            ))}
          </div>
          <button onClick={openStoreEditModal} className={styles.editButton}><FaEdit /> Edit Store</button>
          <label htmlFor="coverImage" className={styles.coverFormLabel}><FaImage /></label>
          <input type="file" id="coverImage" onChange={handleCoverImageChange} className={styles.coverInput} />
          <button onClick={openCoverConfirmModal} className={styles.uploadButton}>Upload</button>
        </motion.div>
      </motion.div>
      <div className={styles.productsContainer}>
        {products.map(product => (
          <div key={product.id} className={styles.productCard}>
            {editingProduct?.id === product.id ? (
              <form onSubmit={handleProductUpdate} className={styles.editProductForm}>
                <input 
                  type="text"
                  name="name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className={styles.productInput}
                  required
                />
                <textarea
                  name="description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className={styles.productInput}
                  required
                />
                <input 
                  type="number"
                  name="price"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  className={styles.productInput}
                  required
                />
                <input 
                  type="number"
                  name="quantity"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                  className={styles.productInput}
                  required
                />
                <input
                  type="file"
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.files[0] })}
                  className={styles.productInput}
                />
                <button type="submit" className={styles.saveButton}><FaSave /> Save</button>
                <button type="button" className={styles.cancelButton} onClick={() => setEditingProduct(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <img src={product.image} alt={product.name} className={styles.productImage} />
                <div className={styles.productDetails}>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className={styles.productPriceTag}>
                    <span className={styles.productPrice}>{`$${product.price}`}</span>
                    <span className={styles.productQuantity}>{`Quantity: ${product.quantity}`}</span>
                  </div>
                  <div className={styles.productActions}>
                    <button className={styles.editButton} onClick={() => handleProductEdit(product)}>
                      <FaEdit /> Edit
                    </button>
                    <button className={styles.deleteButton} onClick={() => openDeleteConfirmModal(product)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <button className={styles.addButton} onClick={() => setModalIsOpen(true)}>
        <FaPlus /> 
      </button>
      <Modal 
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Add New Product</h2>
        <form onSubmit={handleProductSubmit} className={styles.addProductForm}>
          <input 
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleProductChange}
            placeholder="Product Name"
            className={styles.productInput}
            required
          />
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleProductChange}
            placeholder="Product Description"
            className={styles.productInput}
            required
          />
          <input 
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleProductChange}
            placeholder="Product Price"
            className={styles.productInput}
            required
          />
          <input 
            type="number"
            name="quantity"
            value={newProduct.quantity}
            onChange={handleProductChange}
            placeholder="Product Quantity"
            className={styles.productInput}
            required
          />
          <input 
            type="file"
            name="image"
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
            className={styles.productInput}
            required
          />
          <button type="submit" className={styles.saveButton}>Add Product</button>
        </form>
      </Modal>
      <Modal 
        isOpen={storeEditModalIsOpen}
        onRequestClose={closeStoreEditModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Edit Store Details</h2>
        <form onSubmit={handleStoreUpdate} className={styles.storeEditForm}>
          <input 
            type="text"
            name="name"
            value={editingStore.name}
            onChange={handleStoreEditChange}
            placeholder="Store Name"
            className={styles.storeInput}
            required
          />
          <input 
            type="text"
            name="address"
            value={editingStore.address}
            onChange={handleStoreEditChange}
            placeholder="Store Address"
            className={styles.storeInput}
            required
          />
          <input 
            type="text"
            name="phone"
            value={editingStore.phone}
            onChange={handleStoreEditChange}
            placeholder="Store Phone"
            className={styles.storeInput}
            required
          />
          <button type="submit" className={styles.saveButton}>Save</button>
        </form>
      </Modal>
      <Modal 
        isOpen={coverConfirmModalIsOpen}
        onRequestClose={closeCoverConfirmModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Confirm Cover Image Update</h2>
        <p>Are you sure you want to update the cover image?</p>
        <button onClick={handleCoverImageSubmit} className={styles.saveButton}>Yes, Update</button>
        <button onClick={closeCoverConfirmModal} className={styles.cancelButton}>Cancel</button>
      </Modal>
      <Modal 
        isOpen={deleteConfirmModalIsOpen}
        onRequestClose={closeDeleteConfirmModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this product?</p>
        <button onClick={() => {
          handleProductDelete(editingProduct.id);
          closeDeleteConfirmModal();
        }} className={styles.saveButton}>Yes, Delete</button>
        <button onClick={closeDeleteConfirmModal} className={styles.cancelButton}>Cancel</button>
      </Modal>
    </div>
  );
};

export default withAuth(MyStorePage);
