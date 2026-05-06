import { useState } from 'react';

/**
 * ItemForm Component
 * A generic form component with dynamic fields and basic validation.
 */
export const ItemForm = ({ onSubmit, fields = [], initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} wajib diisi`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="item-form">
      {fields.map(field => (
        <div key={field.name} className="space-y-2">
          <label 
            htmlFor={field.name}
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
          >
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input 
            id={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            name={field.name}
            className={`w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#660000] transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors[field.name] ? 'ring-2 ring-red-500' : ''}`}
            value={formData[field.name] || ''}
            onChange={(e) => {
              setFormData({...formData, [field.name]: e.target.value});
              if (errors[field.name]) setErrors({...errors, [field.name]: ''});
            }}
          />
          {errors[field.name] && (
            <p className="text-xs text-red-500 ml-1" role="alert">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}
      <button 
        type="submit"
        className="w-full bg-[#660000] text-white py-4 rounded-2xl font-bold hover:bg-[#550000] transition-all shadow-lg shadow-[#660000]/10"
      >
        Simpan
      </button>
    </form>
  );
};

export default ItemForm;