class DdbDiv {
    constructor(name) {
        this.name = name
        this.varNames = []
        this.comments = []
        this.values = []
        this.options = []
        this.types = []

        this.default = ''
    }

    addElement(varName_, comment_, value_, options_, type_) {
        this.varNames.push(varName_)
        this.comments.push(comment_)
        this.values.push(value_)
        this.options.push(options_)
        this.types.push(type_)
    }

    show() {
        let min = 0, max = 0, value = 0, step = 0, k = 0
        let IDstring = ''
        let html = '<div id="' + id + '">\n\t<h1>' + this.name + '</h1>'

        for (let i = 0; i < this.varNames.length; i++) {
            html += '<b>' + this.varNames[i] + '</b><br /><i>' + this.comments[i] + '</i><br />'
            for (let j = 0; j < this.values[i].length; j++) {
                IDstring = id + '_input_' + j
                switch (this.types[i]) {
                    case 'bool':
                        html += '<input id="' + IDstring + '" type="checkbox"'
                        if (this.values[i][0] == 'true') html += ' checked'
                        html += '/>'
                        break
                    case 'number':
                        html += '<input id="' + IDstring + '" type="number" value=' + this.values[i][j] + ' step="' + getStep(this.values[i][j]) + '" style="' + STYLE + '"></input>'
                        break
                    case 'max':
                        max = this.options[i][0]
                        value = this.values[i][0]
                        html += '<input id="' + IDstring + '" type="range" min="0" max="' + max + '" value="' + value + '" oninput="document.getElementById(\'' + IDstring + '_text\').value = document.getElementById(\'' + IDstring + '\').value" />'
                        html += '<input id="' + IDstring + '_text" type="number" min="0" max="' + max + '" value="' + value + '" step="' + getStep(this.values[i][0]) + '" oninput=\'document.getElementById("' + IDstring + '").value = document.getElementById("' + IDstring + '_text").value\' style="' + STYLE + '"/>'
                        break
                    case 'range':
                        min = this.options[i][0]
                        max = this.options[i][1]
                        value = this.values[i][0]
                        html += '<input id="' + IDstring + '" type="range" min="' + min + '" max="' + max + '" value="' + value + '" oninput=\'document.getElementById("' + IDstring + '_text").value = document.getElementById("' + IDstring + '").value\' />'
                        html += '<input id="' + IDstring + '_text" type="number" min="' + min + '" max="' + max + '" value="' + value + '" step="' + getStep(this.values[i][0]) + '" oninput=\'document.getElementById("' + IDstring + '").value = document.getElementById("' + IDstring + '_text").value\' style="' + STYLE + '"/>'
                        break
                    case 'rangestep':
                        min = this.options[i][0]
                        step = this.options[i][1]
                        max = this.options[i][2]
                        value = this.values[i][0]
                        html += '<input id="' + IDstring + '" type="range" min="' + min + '" step="' + step + '" max="' + max + '" value="' + value + '" oninput=\'document.getElementById("' + IDstring + '_text").value = document.getElementById("' + IDstring + '").value\' />'
                        html += '<input id="' + IDstring + '_text" type="number" min="' + min + '" max="' + max + '" value="' + value + '" step="' + step + '" oninput=\'document.getElementById("' + IDstring + '").value = document.getElementById("' + IDstring + '_text").value\' style="' + STYLE + '"/>'
                        break
                    case 'string':
                        html += '<input id="' + IDstring + '" type="text" value=' + this.values[i][j] + ' step="' + getStep(this.values[i][j]) + '" style="' + STYLE + '"></input>'
                        break
                    case 'length':
                        html += '<input id="' + IDstring + '" value="' + this.values[i][0] + '" type="text" maxlength="' + this.options[i][0] + '" />'
                        break
                    case 'combobox':
                        html += '<select id="' + IDstring + '" style="' + STYLE + '">'
                        html += '<option value="' + this.values[i][j] + '" hidden>' + this.values[i][j] + '</option>'
                        for (let k = 0; k < this.options[i].length; k++) html += '<option value="' + this.options[i][k] + '">' + this.options[i][k] + '</option>'
                        html += '</select>'
                        break
                    case 'labelled':
                        let defaultValue = this.options[i][0][1]
                        for (let k = 0; k < this.options[i].length; k++) if (this.values[i][j] == this.options[i][k][0]) defaultValue = this.options[i][k][1]

                        html += '<select id="' + IDstring + '" style="' + STYLE + '">'
                        html += '<option value="' + defaultValue + '" hidden>' + defaultValue + '</option>'
                        for (let k = 0; k < this.options[i].length; k++) html += '<option value="' + this.options[i][k][1] + '">' + this.options[i][k][1] + '</option>'
                        html += '</select>'
                        break
                    default: break
                }
            }
            html += '<br /><br />'
            id++
        }

        html += '</div>'
        document.getElementById('container').innerHTML += html
    }
}

STYLE = 'width: 4em; margin-left: 1em;'

ddbList = []
shouldSkip = false
id = 0

function parse_text_as_scad(text) {
    document.getElementById("container").innerHTML = '';
    const ddbOpenRe = /^[ 	]*\/\*[	 ]*\[/
    const ddbCloseRe = /\][	 ]*\*\//

    let comment = ''
    let valType = ''
    let varName = ''
    let value = []
    let optionsType = ''
    let options = []

    let shouldSkip_ = false

    text.split('\n').forEach((line) => {
        if (shouldSkip_) return

        switch (detect_line_type(line)) {
            case 'ddb':
                ddbName = line.replace(ddbOpenRe, '').replace(ddbCloseRe, '')
                ddbList.push(new DdbDiv(ddbName))
                break
            case 'comment': return comment = line.replace(/^[	 ]*\/\/[	 ]*/, '')
            case 'declaration':
                [valType, varName, value] = get_declaration(line, comment)
                if (valType != 'invalid') {
                    [optionsType, options] = get_options(line)
                    if (optionsType != 'invalid') {
                        if (comment == '' && optionsType == 'comment') comment = options[0]

                        let validDeclaration = true
                        let list = optionsType.includes('list')
                        let valType_ = valType.replace('list_', '')
                        let optionsType_ = optionsType.replace('list_', '')

                        switch (optionsType_) {
                            case 'empty': break
                            case 'comment': break
                            case 'number':
                                validDeclaration = ((list == true && valType_ == 'number') || (valType_ == 'string'))
                                if (valType_ == 'string') valType_ = 'length'
                                break
                            case 'expression': case 'string':
                                validDeclaration = (list == true && valType_ == 'string')
                                break
                            case 'labelled':
                                validDeclaration = (valType_ == 'string')
                                valType_ = optionsType_
                                break
                            case 'bool': break
                            case 'max': case 'range': case 'rangestep':
                                validDeclaration = (valType_ == 'number')
                                valType_ = optionsType_
                                break
                            default: validDeclaration = false
                        }

                        if (optionsType.includes('list')) valType_ = 'combobox'

                        if (validDeclaration) {
                            pushToDDB(varName, comment, value, options, valType_)
                            // console.log(valType + ': ' + varName + ' = ' + value + '; // ' + options + ' (' + optionsType + ')')
                        } else showError('Invalid combination of parameter and options: ' + valType + ' can be used together with ' + optionsType + '\n\n' + line)
                    }
                }
                comment = ''
                break
            case 'module':
                shouldSkip_ = true
                break
            case 'empty': break
            default: return;
        }
    })


    id = 0
    for (I = 0; I < ddbList.length; I++) ddbList[I].show()
}

function detect_line_type(line) {
    const ddbRe = /^[ 	]*\/\*[	 ]*\[.*\][	 ]*\*\//
    const commentRe = /^[ 	]*\/\/[ 	]*/
    const declarationRe = /^[ 	]*\$?([a-zA-Z_]+[0-9]*)+ *= *.+;/
    const moduleRe = /^[	 ]*module/

    line_ = []
    line.split(' ').forEach((entry) => {
        if (entry != '') line_.push(entry)
    })
    if (line_.length == 0) return 'empty'
    else if (ddbRe.exec(line) != null) return 'ddb'
    else if (commentRe.exec(line) != null) return 'comment'
    else if (declarationRe.exec(line) != null) return 'declaration'
    else if (moduleRe.exec(line) != null) return 'module'
}

function get_declaration(line, comment) {
    let varName = line.replace(/^[ 	]*/, '').replace(/[ 	]*=[ 	]*.+/, '')
    let valueString = line.replace(/^[ 	]*\$?([a-zA-Z_]+[0-9]*)+[ 	]*=[ 	]*/, '').replace(/[ 	]*;.*/, '')

    let value = []
    let valType = ''
    let listType = ''

    shouldSkip = false

    valType = get_value_type(valueString)
    if (valType == 'invalid') showError('Invalid declaration: ' + line)
    else if (valType == 'expression') shouldSkip = true
    else if (valType != 'list' && valType != 'expression' && valType != 'labelled') value = [extract_value(valueString, valType)]
    else if (valType == 'list') {
        valueString.replace(/^[	 ]*\[/, '').replace(/\][	 ]*$/, '').split(',').forEach((val) => {
            tmpType = get_value_type(val)
            if (shouldSkip) { }
            else if (val == '') showError('Empty entry in list: ' + line)
            else if (tmpType == 'invalid') showError('Invalid declaration: ' + line)
            else if (tmpType == 'list') shouldSkip = true // let's not allow nested lists in the customizer
            else if (tmpType == 'expression') shouldSkip = true
            else if (tmpType != listType && listType != '') shouldSkip = true // let's not allow different types in the same list
            else {
                listType = tmpType
                value.push(extract_value(val, listType))
            }
        })

    }

    if (shouldSkip == true) valType = 'invalid'
    else if (valType == 'list') valType += '_' + listType
    return [valType, varName, value]
}

function get_value_type(value_) {
    const stringRe = /^[	 ]*"[^"]*"[	 ]*$/
    const listRe = /^[	 ]*\[.*\][	 ]*$/
    const boolRe = /^[	 ]*(true|false)[	 ]*$/
    const expressionRe = /^[	 ]*[^"].*[a-zA-Z_\*\+]+.*[^"][	 ]*$/
    const labelledRe = /\[([^:\[\],]*:[^:\[\],]*,[	 ]*)+([^:\[\],]*:[^:\[\],]*[	 ]*)?\]$/
    const rangeRe = /^[	 ]*\[([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*):([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*)\]$/
    const rangestepRe = /^[	 ]*\[([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*):([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*):([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*)\]$/
    const vddvRe = /^[	 ]*[^:\[\],]*:[^:\[\],]*[	 ]*$/

    if (!isNaN(value_)) return 'number'
    else if (stringRe.exec(value_) != null) return 'string'
    else if (labelledRe.exec(value_) != null) return 'labelled'
    else if (rangeRe.exec(value_) != null) return 'range'
    else if (rangestepRe.exec(value_) != null) return 'rangestep'
    else if (vddvRe.exec(value_) != null) return 'v:v'	//	a range can also be interpreted as a label, so we can only detect value:value here without knowing the options type
    else if (listRe.exec(value_) != null) return 'list'
    else if (boolRe.exec(value_) != null) return 'bool'
    else if (expressionRe.exec(value_) != null) return 'expression'
    else return 'invalid'

    // value type will be converted to 'max' later when the options are a list of single entry. E.g.: max_number = 10; // [50]
    // value type will be converted to 'label' later when when looking at a single entry in a list. [s:small, m:medium] is of type labelled, but s:small is a label
    // value type will be converted to 'empty' later when a declaration has no comment after the semicolon. E.g.: x = 0;
    /*
        value type will be converted to 'comment' in get_options(...) when the comment after the declaration does not fall into a valid category. E.g.:

        y = 0; // 6 * 2

        The text after ;// is an expression, which is not a valid optionsType. It is therefore automatically interpreted as a comment. In this case, there is no comment
        before the declaration. So the "6 * 2" comment will in fact be used as a variable explanation.
    */
}

function extract_value(value_, valType) {
    switch (valType) {
        case 'number': return parseFloat(value_)
        case 'string': return value_.replace(/^[	 ]*"/, '').replace(/"[	 ]*$/, '')
        case 'bool': return value_.replace(/^[	 ]*/, '').replace(/[	 ]*$/, '') == 'true'
        case 'label': return [value_.replace(/:[^:\[\],]*[	 ]*$/, ''), value_.replace(/^[	 ]*[^:\[\],]*:/, '')]
        case 'range': return [
            parseFloat(value_.replace(/^[	 ]*\[[	 ]*/, '').replace(/:[	 ]*-?[0-9]*(.[0-9]*)?[	 ]*\]$/, '')),
            parseFloat(value_.replace(/[	 ]*\[[	 ]*-?[0-9]*(.[0-9]*)?[	 ]*:/, '').replace(/[	 ]*\]$/, ''))
        ]
        case 'rangestep': return [
            parseFloat(value_.replace(/^[	 ]*\[/, '').replace(/:([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*):([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*)\]$/, '')),
            parseFloat(value_.replace(/^[	 ]*\[([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*):/, '').replace(/:([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*)\]$/, '')),
            parseFloat(value_.replace(/^[	 ]*\[([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*):([	 ]*-?[0-9]*(\.[0-9]*)?[	 ]*):/, '').replace(/[	 ]*\]$/, ''))
        ]
        default: return value_;
    }
}

function get_options(line) {
    const declarationHasCommentRe = /^[ 	]*\$?([a-zA-Z_]+[0-9]*)+ *= *.+;[	 ]*\/\/[	 ]*/

    let optionsType = 'empty'
    let options = []
    let listType = ''

    shouldSkip = false

    if (declarationHasCommentRe.exec(line) != null) {
        optionsString = line.replace(declarationHasCommentRe, '').replace(/[	 ]*$/, '')
        optionsType = get_value_type(optionsString)
        if (optionsType != 'number' && optionsType != 'list' && optionsType != 'labelled' && optionsType != 'range' && optionsType != 'rangestep') {
            optionsType = 'comment'
            options = [optionsString]
        }
        else if (optionsType == 'number') options = [extract_value(optionsString, optionsType)]
        else if (optionsType == 'range') options = extract_value(optionsString, optionsType)
        else if (optionsType == 'rangestep') {
            options = extract_value(optionsString, optionsType)
            if ((options[0] < options[2] && options[1] < 0) || (options[0] > options[2] && options[1] > 0)) {
                alert('Invalid range: ' + line)
                shouldSkip = true
            }
        }
        else if (optionsType == 'list' || optionsType == 'labelled') {
            optionsString.replace(/^[	 ]*\[/, '').replace(/\][	 ]*$/, '').split(',').forEach((val) => {
                tmpType = get_value_type(val)
                if (tmpType == 'v:v' && optionsType == 'labelled') tmpType = 'label'

                if (shouldSkip) return
                else if (val == '') {
                    if (optionsType != 'labelled') showError('Empty entry in list: ' + line)
                    shouldSkip = true
                }
                else if (tmpType == 'invalid') showError('Invalid declaration: ' + line)
                else if (tmpType == 'list') showError('Illegal nesting of lists: ' + line)
                else if (tmpType != listType && listType != '') showError('Illegal mixing of types: ' + line)
                else {
                    listType = tmpType
                    options.push(extract_value(val, listType))
                }
            })
        }
    }

    if (optionsType == 'list' && listType == 'number' && options.length == 1) optionsType = 'max'
    else if (optionsType == 'list') optionsType += '_' + listType
    else if (shouldSkip == true && optionsType != 'labelled') optionsType = 'invalid'

    return [optionsType, options]
}

function showError(msg) {
    alert(msg)
    shouldSkip = true
}

function pushToDDB(varName, comment, value, options, type) {
    if (ddbList.length == 0) ddbList.push(new DdbDiv(''))
    ddbList[ddbList.length - 1].addElement(varName, comment, value, options, type)
}

function getStep(val) {
    str = val.toString().split('.')

    if (str.length == 1) return 1
    else return 1 / (10 ** str[1].length)
}

async function generate_param_string() {
    let parameterSet = { "parameterSets": { "FirstSet": {} } }

    let IDString = ''
    let valString = ''
    let tmp = ''
    id = 0
    for (let i = 0; i < ddbList.length; i++) {
        varNames = ddbList[i].varNames;
        values = ddbList[i].values;
        types = ddbList[i].types;
        options = ddbList[i].options;
        for (let j = 0; j < types.length; j++) {
            valString += varNames[j] + ' = '
            if (values[j].length > 1) valString += '['
            if (types[j] == 'checkbox') valString += document.getElementById(id + '_input_0').checked
            else if (types[j] == 'labelled') {
                for (let k = 0; k < values[j].length; k++) {
                    IDString = id + '_input_' + k
                    tmp = document.getElementById(IDString).value
                    for (let l = 0; l < options[j].length; l++) {
                        if (options[j][l][1] == tmp) {
                            valString += '"' + options[j][l][0] + '"'
                            break
                        }
                    }
                    if (k != values[j].length - 1) valString += ', '
                }
            }
            else {
                for (let k = 0; k < values[j].length; k++) {
                    IDString = id + '_input_' + k
                    tmp = document.getElementById(IDString).value
                    if (isNaN(tmp)) valString += '"' + tmp + '"'
                    else valString += tmp
                    if (k != values[j].length - 1) valString += ', '
                }
            }
            if (values[j].length > 1) valString += ']'
            valString += ';\n'
            id++
        }
    }

    alert(valString);
    console.log(valString);
    return valString;
}