/***************************
************ Slider ********
***************************/
function UpdateSliderLabel() {
    var slider_element = document.getElementById("slider_id");
    document.getElementById("sliderCurrentValue").innerHTML = (+slider_element.value).toFixed(2); //set number of digits to appear after the decimal point;
}

function InitializeSlider() {
    var slider_element = document.getElementById("slider_id");
    UpdateSliderLabel();

    slider_element.oninput = function () {
        UpdateSliderLabel();
    }
    slider_element.onmouseup = function () {
        UpdateSliderLabel();
        RenderInputFile();
    }
}

function MoveSliderProgrammatically(delta) {
    var slider_element = document.getElementById("slider_id");
    var cur = parseFloat(slider_element.value);
    var curStep = parseFloat(slider_element.step);
    if(delta<0)
        curStep = -1*curStep;
    cur = cur + curStep;
    slider_element.value = cur;
    UpdateSliderLabel();
    slider_element.onmouseup();
}

/***************************
********** Checkbox ********
***************************/
function InitializeCheckbox() {
    var checkbox = document.getElementById("HidelonelyNodesCheckbox");
    checkbox.onchange = function () {
        RenderInputFile();
    }
}

/***************************
********** Combobox ********
***************************/
function InitializeCombobox() {
    var nodeTypes_cb = document.getElementById("nodeTypes_cb");
    nodeTypes_cb.onchange = function () {
        RenderInputFile();
    }
}

function SetAllContollersDisabled(isDisabled)
{
    var nodes = document.getElementsByClassName("controllersBox")[0].getElementsByTagName('*');
    for(var i = 0; i < nodes.length; i++){
        nodes[i].disabled = isDisabled;
    }
}