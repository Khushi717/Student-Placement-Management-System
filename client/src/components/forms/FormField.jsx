import { forwardRef } from 'react';

function Wrapper({ label, error, hint, children, htmlFor }) {
  return (
    <div>
      {label && <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, id, ...props }, ref) {
  const inputId = id || props.name;
  return <Wrapper label={label} error={error} hint={hint} htmlFor={inputId}><input id={inputId} ref={ref} className="input" {...props} /></Wrapper>;
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, id, rows = 4, ...props }, ref) {
  const inputId = id || props.name;
  return <Wrapper label={label} error={error} hint={hint} htmlFor={inputId}><textarea id={inputId} ref={ref} rows={rows} className="input" {...props} /></Wrapper>;
});

export const Select = forwardRef(function Select({ label, error, hint, id, options = [], placeholder, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <Wrapper label={label} error={error} hint={hint} htmlFor={inputId}>
      <select id={inputId} ref={ref} className="input" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </Wrapper>
  );
});
