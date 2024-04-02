import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Modal({ isOpen, onClose, children }) {
    //isOpen:打開編輯，pop-up編輯視窗
    //onClose:X按鈕
    const [modalState, setModalState] = useState('opacity-0');

    useEffect(() => {
        if (isOpen) {
            setModalState('opacity-0');
            setTimeout(() => setModalState('opacity-100'), 10);
        } else {
            setModalState('opacity-0');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (

        <div
            className={`fixed inset-0 flex w-full mt-20  justify-end z-50 duration-500 ${modalState}`}>
            <div className="mr-4">
            <div className="absolute inset-0 " onClick={onClose}></div>
            <div
                className="bg-white p-8 rounded-lg relative z-10 border-2 border-gray-300"
                style={{
                    height: 'fit-content',
                    maxHeight: 'calc(100vh - 40px)',
                    overflowY: 'auto',
                    minWidth: '20vw'
                }}
            >
                {children}
            </div>
            </div>
        </div>

    );
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default Modal;