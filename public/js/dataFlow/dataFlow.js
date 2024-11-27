
const formModal = document.getElementById("form-modal");
const notificationModal = document.getElementById("staticBackdrop");

//console.log( 'hola esto es lo que muestra',LocalStorage.getItem('source'));
/**
 *
 * @param {string} modalId
 * @returns {Object}
 */
function extractData() {
  const data = {
    server: formModal.querySelector("#serverName").value,
    dataBase: formModal.querySelector("#dbName").value,
    user: formModal.querySelector("#userName").value,
    password: formModal.querySelector("#userPassword").value,
    sqlCommand: formModal.querySelector("#sqlCommandInput").value,
    table: formModal.querySelector('#tableNameSelect').value,
    method: formModal.querySelector('#methodSelection').value,
  };
  return data;
}



async function dbConnection() {
  var formData = extractData();

  try {
    const response = await fetch("/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    let ETLObject = JSON.parse(window.localStorage.getItem('currentETL')); //obtiene el objeto del ETL actual
    ETLObject["source"] = result.testQueryResult.source; // le acopla la informacion de la tabla
    ETLObject["connectionParams"] = formData; // le acopla la informacion de la conexion
    let controlFlowInfo = JSON.parse(window.localStorage.getItem('controlBlocks')); // obtiene el objeto de controlFLow
    // iterar a traves de conFlowInfo y verificar si la propiedad id === a localStorage.getItem('controlBlockId')
    let currentControlBlockId = window.localStorage.getItem('controlBlockId');
    for (let object of controlFlowInfo){
      if (object.id===currentControlBlockId){
        object.etls.push(ETLObject);
      }
    }
    // controlFlowInfo.etls.push(ETLObject); // le acopla el objeto del ETL con la informacion nueva
    window.localStorage.setItem('controlBlocks', JSON.stringify(controlFlowInfo)); // vuelve a guardar el objeto de controlFlow con la nueva informacion
    
    toggleModal(this); //cierra la modal de formulario de conexion
    notificationModal.querySelector(".modal-body").innerText = result.message; // escribe el mensaje de respuesta en el cuerpo de la modal
    console.log(result.testQueryResult.source);
    window.localStorage.setItem("source", JSON.stringify(result.testQueryResult.source));
    toggleNotificationModal(); // abre la modal de notificaciones y muestra mensaje
    console.log( 'hola esto es lo que muestra',LocalStorage.getItem('source'));
  } catch (error) {
    console.log(error);
  }
}



async function extractTableNames(){
  const formData = extractData();
  try {
    const response = await fetch("/tableNames", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    return result.testQueryResult;
  } catch (error) {
    console.log(error);
  }
}



//funcion verifica si el metodo que se indicaron los campos a obtener 
//son solicitado a traves del campos de comandos de SQL or table
async function checkSelectValue() {
  if (this.value==='sqlCommand'){
        formModal.querySelector('#tableNameLabel').style.display='none'
    formModal.querySelector('#tableNameSelect').style.display='none'
    formModal.querySelector('#sqlCommandLabel').style.display="block";
    formModal.querySelector('#sqlCommandInput').style.display="block";
    console.log("sqlCommand value!")
  }
  
  if (this.value==='table'){

    const queryResult = await extractTableNames();

    console.log(queryResult);
    for (let table of queryResult.recordset){
      let tableOption = document.createElement('option');
      tableOption.value=table.table_name;
      tableOption.innerText=table.table_name;
      formModal.querySelector('#tableNameSelect').appendChild(tableOption);
    }
    formModal.querySelector('#sqlCommandLabel').style.display="none";
    formModal.querySelector('#sqlCommandInput').style.display="none";
    formModal.querySelector('#tableNameLabel').style.display='block'
    formModal.querySelector('#tableNameSelect').style.display='block'
    console.log("table value!")
  }
}


/**
 *
 * @param {string} typeOfBlockDraggedId
 * set html content for modals
 */
function setModalHtmlContent(typeOfBlockDraggedId) {
  const modalContentDiv = formModal.childNodes[1].childNodes[1];
  if (typeOfBlockDraggedId == "draggable-source") {
    modalContentDiv.innerHTML = `<div class="modal-header">
                  <h5 class="modal-title">Conexión</h5>
                  <button id="close-form-modal-btn" type="button" class="btn-close"  data-bs-dismiss="modal" aria-label="Close" onclick="toggleModal()"></button>
                </div>
                <div class="modal-body d-flex flex-column gap-1">
                  <label for="serverName" >Nombre del servidor</label>
                  <input class="form-control" type="text" name="serverName" id="serverName">

                  <label for="dbName" >Nombre de la Base de Datos</label>
                  <input class="form-control" type="text" name="dbName" id="dbName">

                  <label for="userName" >Usuario</label>
                  <input class="form-control" type="text" name="user" id="userName">

                  <label for="userPassword" >Contraseña</label>
                  <input class="form-control" type="password" name="password" id="userPassword">
                  
                  <label for="methodSelection"  >Escoge un método: </label>
                  <select id="methodSelection" name="method" >
                    <option value="">Elige una opcion</option>
                    <option value="table" >Tabla</option>
                    <option value="sqlCommand" >SQL Command</option>
                  </select>
                  <br>
                  
                  <label for="tableSelection" style="display:none" id="tableNameLabel" >Escoge una tabla: </label>
                  <select id="tableNameSelect" name="tableSelection" style="display:none" >
                    
                  </select>

                  <label id="sqlCommandLabel" for="sqlCommandInput" style="display:none" >Comando SQL</label>
                  <textarea name="sqlCommand" id="sqlCommandInput"   placeholder="SELECT * FROM users;" rows="10" cols="45" style="display:none; min-height: 80px"></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                </div>`;
                formModal.querySelector('#methodSelection')
                .addEventListener('change', checkSelectValue);
  }
  if (typeOfBlockDraggedId == "draggable-conversion") {
    const dataFromSourceOLEDB = LocalStorage.getItem('source')
    
    if (!dataFromSourceOLEDB) {
        modalContentDiv.innerHTML = `<div class="modal-header">
                  <h5 class="modal-title">Conexión</h5>
                  <button id="close-form-modal-btn" type="button" class="btn-close"  data-bs-dismiss="modal" aria-label="Close" onclick="toggleModal()"></button>
                </div>
                <div class="modal-body">
                    <h3>Datos de source OLEDB no encontrados!</h3>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                </div>`;
 
    } else {
        modalContentDiv.innerHTML = `<div class="modal-header">
                      <h5 class="modal-title">Data conversion</h5>
                      <button id="close-form-modal-btn" type="button" class="btn-close"  data-bs-dismiss="modal" aria-label="Close" onclick="toggleModal()"></button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <table class="table">
                                <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Output alias</th>
                                    <th>Data type</th>
                                    <th>Length</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody id="tbody">
                                <!-- seccion dinamica-->
                                </tbody>
                            </table>
                        </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                    </div>`;

        // TODO: iterate through every column from source oledb
        //const tableBody = document.getElementById('tbody')
        //iterar los campos de las tablas seleccionados para que se muestrn en la modal 
        // Selección del cuerpo de la tabla
        
        // Recuperar el objeto del ETL actual en el que estamos, desde `localStorage`
        const currentETLObject = JSON.parse(localStorage.getItem('currentETL'));
        const divPadreId = currentETLObject ? currentETLObject.etlID : null;     // Acceder solo a la propiedad `etlID`

        // Verificar y usar el valor de `etlID`
        if (divPadreId) {
          console.log("ID del div padre:", divPadreId);
        } else {
          console.log("No se encontró el etlID en localStorage.");
        }

        const controlBlocks = JSON.parse(localStorage.getItem('controlBlocks'));

        if (!controlBlocks || controlBlocks.length === 0) {                                   // Verifica si controlBlocks existe y no está vacío
          console.error("No se encontraron datos en 'controlBlocks' o está vacío.");
        } else {
          const filteredETL = controlBlocks[0].etls.filter(etl => etl.etlID === divPadreId);  // Filtra el ETL cuyo etlID coincide con divId
          
          if (filteredETL.length === 0) {                                                     // Verifica si filteredETL tiene al menos un elemento
            console.error(`No se encontró ningún ETL con el etlID: ${divPadreId}`);
          } else { 
            /*const sourceData = filteredETL[0].source;                                         // Accede al 'source' del ETL filtrado
            const tableBody = document.getElementById('tbody');
            tableBody.innerHTML = "";                                                         // Limpiar contenido anterior si es necesario
         
            //let operationOptions = getOperationOptions(dataType);                             // Definir opciones de operaciones según tipo de dato
            
            // Iterar sobre cada columna de 'source' y agregar filas a la tabla
            Object.keys(sourceData).forEach(columnName => {
              const columnData = sourceData[columnName];
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${columnName}</td>  <!-- Nombre de la columna -->
                <td>copy of ${columnName}</td>  <!-- Alias de salida -->
                <td>${columnData.dataType}</td>  <!-- Tipo de dato -->
                <td>${columnData.length !== null ? columnData.length : 'N/A'}</td>  <!-- Longitud -->
                <td>
                  <select>
                    <option value="capitalize">Capitalize</option>
                    <option value="uppercase">Uppercase</option>
                    <option value="lowercase">Lowercase</option>
                  </select>
                </td>
              `;
              tableBody.appendChild(row);  // Añadir fila a la tabla
            });*/

            const sourceData = filteredETL[0].source;
            
            const tableBody = document.getElementById('tbody');
            tableBody.innerHTML = "";

           
            Object.keys(sourceData).forEach(columnName => {
              const columnData = sourceData[columnName];
              const operationOptions = getOperationOptions(columnData.dataType);
              
              // Lógica para crear filas en la tabla
              if (operationOptions) {
                
                const lengthContent = renderLengthField(columnData);         // Usamos la función renderLengthField indicar la longitud a los tipos de datos que lo requieren 
                const row = document.createElement('tr');
                row.innerHTML = `
                  <td>${columnName}</td>
                  <td>copy of ${columnName}</td>
                  <td>${columnData.dataType}</td>
                  <td>${lengthContent}</td>
                  <td>
                    <select>
                      ${operationOptions}
                    </select>
                  </td>
                `;
                tableBody.appendChild(row);
              }
            });
                        
          }
        }
        
        
    }
  }
  if (typeOfBlockDraggedId == "draggable-destination") {
    modalContentDiv.innerHTML = `<div class="modal-header">
                  <h5 class="modal-title">Data conversion</h5>
                  <button id="close-form-modal-btn" type="button" class="btn-close"  data-bs-dismiss="modal" aria-label="Close" onclick="toggleModal()"></button>
                </div>
                <div class="modal-body">
                  <h2>DATA CONVERSION</h2>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                </div>`;
  }
}





// Función  para obtener opciones según el tipo de dato
function getOperationOptions(dataType) {
  if (dataType.includes('char') || dataType.includes('varchar')) {      // Operaciones para cadenas
    
    return `
      <option value="capitalize">Capitalize</option>
      <option value="uppercase">Uppercase</option>
      <option value="lowercase">Lowercase</option>
      <option value="concat">Concatenate</option>
    `;
  } else if (dataType.includes('date') || dataType.includes('time')) {    // Operaciones para fechas
    
    return `
      <option value="getDay">Get Day</option>
      <option value="getMonth">Get Month</option>
      <option value="getYear">Get Year</option>
      <option value="getTime">Get Time</option>
      <option value="concat">Concatenate</option>
    `;
  } else if (dataType.includes('int') || dataType.includes('float')) {
    
    return `
      <option value="concat">Concatenate</option>
    `;
  }
  return '';  // Devolver vacío si no hay operaciones válidas
}


function renderLengthField(columnData) {
  // Validación para tipos de datos que pueden tener longitud
  if (columnData.dataType.includes('char') || columnData.dataType.includes('varchar') || columnData.dataType.includes('int') || columnData.dataType.includes('float')) {
    return columnData.length !== null ? 
      `<input type="number" value="${columnData.length}" class="editable-length" />` : 
      `<input type="number" value="null" class="editable-length" />`; // Siempre editable, aunque sea 'null'
  } else if (columnData.dataType.includes('date') || columnData.dataType.includes('time')) {
    
  } else {                                                            // Para tipo date
    
    return 'N/A';                                                     // Para otros tipos de datos que no tengan longitud
  }
}





function toggleModal(target, typeOfBlockDraggedId) {
  setModalHtmlContent(typeOfBlockDraggedId);

  if (formModal.classList.contains("show")) {
    formModal.classList.remove("show");
    formModal.style.display = "none";
  } else {
    // obtiene la informacion de la modal solo si es draggable-destination o draggable-conversion;
    // TODO: una vez bien definida la función getModalInfo descomentar este bloque if
    // if (target.id.includes('draggable-conversion') || target.id.includes('draggable-destination')){
    //     console.log(target.id);
    //     getModalInfo(target);
    // }
    let ETLObject = {
      etlID: target.parentNode.id,
    }
    console.log(ETLObject)
    window.localStorage.setItem('currentETL', JSON.stringify(ETLObject)); //almacena un objeto de ETL solo con el id del Padre
    formModal.classList.add("show");
    formModal.style.display = "block";
  }
}

function toggleNotificationModal() {
  if (notificationModal.classList.contains("show")) {
    notificationModal.classList.remove("show");
    notificationModal.style.display = "none";
  } else {
    notificationModal.classList.add("show");
    notificationModal.style.display = "block";
  }
}

notificationModal
  .querySelector(".modal-footer button")
  .addEventListener("click", toggleNotificationModal);
notificationModal
  .querySelector(".modal-header button")
  .addEventListener("click", toggleNotificationModal);

function getNotificationModalInfo(result) {
  notificationModal.querySelector(".modal-title").innerText = result.message;
  notificationModal.querySelector(".modal-body").innerHTML = ``;
}





