const Validator = (options) => {
    const getParent = (element, selector) => {
      while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
          return element.parentElement;
        }
        element = element.parentElement;
      }
    };
  
    let selectorRules = {};
    // Thực hiện Validate
    const validate = (inputElement, rule) => {
      let errorElement = getParent(
        inputElement,
        options.formGroupSelector
      ).querySelector(options.errorSelector);
      let errorMessage;
  
      // Lấy ra các rules của selector
      let rules = selectorRules[rule.selector];
  
      // Lặp qua từng rule & kiểm tra
      // Nếu có lỗi thì dừng việc kiểm tra
      for (var i = 0; i < rules.length; i++) {
        switch (inputElement.type) {
          case "radio":
          case "checkbox":
            errorMessage = rules[i](
              formElement.querySelector(rule.selector + ":checked")
            );
            break;
          default:
            errorMessage = rules[i](inputElement.value);
        }
  
        if (errorMessage) break;
      }
  
      if (errorMessage) {
        errorElement.innerText = errorMessage;
        getParent(inputElement, options.formGroupSelector).classList.add(
          "invalid"
        );
      } else {
        errorElement.innerText = "";
        getParent(inputElement, options.formGroupSelector).classList.remove(
          "invalid"
        );
      }
  
      return !errorMessage;
    };
    //Lấy element của form cần validate
    let formElement = document.querySelector(options.form);
    if (formElement) {
      formElement.onsubmit = (e) => {
        // Bỏ sự kiện mặc định khi submit form
        e.preventDefault();
  
        let isFormValid = true;
  
        // Lặp qua từng rules và validate
        options.rules.forEach((rule) => {
          let inputElement = formElement.querySelector(rule.selector);
          let isValid = validate(inputElement, rule);
          if (!isValid) {
            isFormValid = false;
          }
        });
  
        if (isFormValid) {
          // Trường hợp submit với JS
          if (typeof options.onSubmit === "function") {
            let enableInputs = formElement.querySelectorAll(
              "[name]:not([disabled])"
            );
            let formValues = Array.from(enableInputs).reduce((values, input) => {
              
              switch(input.type) {
                case 'radio':
                  values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                  break;
                case 'checkbox':
                  if(!input.matches(':checked')) {
                    values[input.name] = '';
                    return values
                  };
                  if(!Array.isArray(values[input.name])) {
                    values[input.name] = [];
                  }
                  
                  values[input.name].push(input.value)
                  break;
                case 'file':
                  values[input.name] = input.files;
                  break;
                default: values[input.name] = input.value;
              }
  
              return values;
            }, {});
            options.onSubmit(formValues);
          }
          // Trường hợp submit bằng sự kiện mặc định
          else {
            formElement.submit();
          }
        }
      };
  
      // Lặp qua mỗi rule và xử lý(lắng nghe sự kiện blur, input,...)
      options.rules.forEach((rule) => {
        // Lưu lại các rule cho mỗi input
        if (Array.isArray(selectorRules[rule.selector])) {
          selectorRules[rule.selector].push(rule.test);
        } else {
          selectorRules[rule.selector] = [rule.test];
        }
  
        let inputElements = formElement.querySelectorAll(rule.selector);
  
        Array.from(inputElements).forEach((inputElement) => {
          // Xử lý trường hợp blur ra ngoài
          inputElement.onblur = () => {
            validate(inputElement, rule);
          };
  
          // Xử lý mỗi khi người dùng nhập vào input
          inputElement.oninput = () => {
            let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
          };
        });
      });
    }
  };
  
  // Định nghĩa các rule
  Validator.isRequired = (selector, message) => {
    return {
      selector: selector,
      test: (value) => {
        return value ? undefined : message || "Vui lòng nhập trường này";
      },
    };
  };
  
  Validator.isEmail = (selector, message) => {
    return {
      selector: selector,
      test: (value) => {
        let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(value)
          ? message || undefined
          : "Vui lòng nhập đúng email";
      },
    };
  };
  
  Validator.minLength = (selector, min, message) => {
    return {
      selector: selector,
      test: (value) => {
        return value.length >= min
          ? undefined
          : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
      },
    };
  };
  
  Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
      selector: selector,
      test: (value) => {
        return value === getConfirmValue()
          ? undefined
          : message || "Mật khẩu nhập lại không trùng khớp";
      },
    };
  };
  