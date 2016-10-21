/**
 * 
 * CPU Simulator
 *
 * 2016, Universidade Federal de Sergipe - UFS
 * Arianne.
 *
 * Enjoy.
 *
 */
$('#stop-cpu').attr("disabled", true);

var mar = null;
var stop_interval = true;
var clock;
var pc_count = 0;
var avaliableAdresses = [];
var operation;
var operand_r;
var operand_id;
var operand;
var operand_jump = null;
var mask = "0000000000000000";
var isPaused = false;
var registerBeingUsed;

var register_A = document.getElementById('register-a');
var register_B = document.getElementById('register-b');

var address_A = document.getElementById('address-a');
var address_B = document.getElementById('address-b');
var address_C = document.getElementById('address-c');
var address_D = document.getElementById('address-d');
var address_E = document.getElementById('address-e');

var addresses = [address_A, address_B, address_C, address_D, address_E];

var output = document.getElementById('output-in');
var decoder = document.getElementById('decoder-in');
var pc = document.getElementById('pc-in');
var ir = document.getElementById('ir-in');
var alu = document.getElementById('alu-in');

var console_cpu = $("#progress-cpu");

function start() {
    mar = 0;
    pc.value = '';
    ir.value = '';
    alu.value = '';
    decoder.value = '';
    register_A.value = '';
    register_B.value = '';
    output.value = '';
    avaliableAdresses = [];
    pc_count = 0;
    stop_interval = true;
    $("#start-cpu").tooltip('hide');

    console_cpu.empty();
    $('#start-cpu').attr("disabled", true);
    $('#stop-cpu').attr("disabled", false);
    $('#run-example').attr("disabled", true);
    $('#pause-cpu').attr("disabled", false);

    for (i in addresses) {
        if (addresses[i].value == "") {
            addresses[i].disabled = true;
        } else {
            addresses[i].disabled = true;
            avaliableAdresses.push(i);
            stop_interval = false;
        }
    }
    console_cpu.append("Iniciando CPU...");
    clock = setInterval(function() {
        if (!isPaused) {
            if (stop_interval) {
                clearInterval(clock);
                stop();
            } else {
                console_cpu.animate({
                    scrollTop: console_cpu[0].scrollHeight
                }, 4000);

                decoder.value = '';
                ir.value = '';
                pc.value = avaliableAdresses[pc_count];
                console_cpu.append("<br><span class='uc'>PC </span>aponta endereço: " + pc_count);
                console_cpu.append(".<br><span class='cycle'>- Busca -</span>");
                setTimeout(function() {
                    ir.value = addresses[avaliableAdresses[pc_count]].value;
                    console_cpu.append("<br><span class='uc'>IR</span> recebe operação.");
                    setTimeout(function() {
                        console_cpu.append("<br><span class='uc'>Unidade de controle</span> envia operação ao decodificador.");
                        cycle(addresses[avaliableAdresses[pc_count]].value);
                        if (stop_interval || pc_count == (avaliableAdresses.length - 1)) {
                            setTimeout(function() {
                                clearInterval(clock);
                                stop_interval = true;
                                stop();
                            }, 1500);
                        }

                        if (operand_jump == null) {
                            mar++;
                            pc_count = mar;
                        } else {
                            operand_jump = null;
                        }
                    }, 1000)
                }, 1000)
            }
        }
    }, 5000);
}

function stop() {
    console_cpu.append("<br>******* Fim do programa *******");
    stop_interval = true;
    $('#start-cpu').attr("disabled", false);
    $('#stop-cpu').attr("disabled", true);
    $('#run-example').attr("disabled", false);
    $('#continue-cpu').attr("disabled", true);
    $('#pause-cpu').attr("disabled", true)

    for (i in addresses) {
        addresses[i].disabled = false;
    }
}

function cycle(opcode) {
    console_cpu.append("<br><span class='cycle'>- Decodificação -</span>");
    opcode = opcode + mask.substring(0, mask.length - opcode.length);
    operation = opcode.substring(0, 3);
    operand_r = opcode.substring(3, 9);
    operand_id = parseInt(opcode.substring(9, 10));
    operand = opcode.substring(10, 16);

    switch (operation) { // OPERAÇÃO AND
        case '000':
            decoder.value = '';
            console_cpu.append("<br><span class='decoder'>Decodificador</span> identifica operação <strong>AND</strong>.");
            decoder.value = 'AND';
            setTimeout(function() {
                console_cpu.append("<br><span class='cycle'>- Execução -</span>");
                console_cpu.append("<br><span class='alu'>ULA</span> recebe operador e operandos.");
                alu.value = " & ";
                var destination = decode_register(operand_r);
                if (destination != null) {
                    if (operand_id == 1) {
                        var origin = decode_register(operand);
                        if (origin != null) {
                            destination.value = (origin.value.toString(2) | destination.value.toString(2));
                            console_cpu.append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe resultado da operação.");
                        } else {
                            console_cpu.append("<br><span class='error'>Código de operando inválido.</span>");
                        }
                    } else {
                        output.value = (parseInt(operand, 2) & parseInt(destination.value, 2)).toString(2);
                        console_cpu.append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe resultado da operação.");
                    }
                } else {
                    console_cpu.append("<br><span class='error'>Código de operando inválido.</span>");
                }
            }, 1000);
            break;

        case '010': // OPERAÇÃO OR
            decoder.value = '';
            console_cpu.append("<br><span class='decoder'>Decodificador</span> identifica operação <strong>OR</strong>.");
            decoder.value = 'OR';
            setTimeout(function() {
                console_cpu.append("<br><span class='cycle'>- Execução -</span>");
                console_cpu.append("<br><span class='alu'>ULA</span> recebe operador e operandos.");
                alu.value = " | ";
                var destination = decode_register(operand_r);
                if (destination != null) {
                    if (operand_id == 1) {
                        var origin = decode_register(operand);
                        if (origin != null) {
                            destination.value = (origin.value.toString(2) | destination.value.toString(2));
                            console_cpu.append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe resultado da operação.");
                        } else {
                            console_cpu.append("<br><span class='error'>Código de operando inválido.</span>");
                        }
                    } else {
                        output.value = (parseInt(operand, 2) | parseInt(destination.value, 2)).toString(2);
                        console_cpu.append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe resultado da operação.");
                    }
                } else {
                    console_cpu.append("<br><span class='error'>Código de operando inválido.</span>");
                }
            }, 1000);
            break;

        case '001': // OPERAÇÃO MOV
            console_cpu.append("<br><span class='decoder'>Decodificador</span> identifica operação <strong>MOV</strong>");
            decoder.value = "MOV";
            setTimeout(function() {
                console_cpu.append("<br><span class='cycle'>- Execução -</span>");
                var destination = decode_register(operand_r);
                if (destination != null) {
                    if (operand_id == 1) {
                        var origin = decode_register(operand);
                        if (origin != null) {
                            destination.value = origin.value;
                            $("#progress-cpu").append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe valor.");
                        } else {
                            $("#progress-cpu").append("<br><span class='error'>Código de operando inválido.</span>");
                        }
                    } else {
                        destination.value = parseInt(operand, 2);
                        $("#progress-cpu").append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe valor.");
                    }
                } else {
                    $("#progress-cpu").append("<br><span class='error'>Código de operando inválido.</span>");
                }
            }, 1000);
            break;

        case '100': // OPERAÇÃO JMP
            console_cpu.append("<br><span class='decoder'>Decodificador</span> identifica operação <strong>JMP</strong>");
            decoder.value = "JMP";
            // setTimeout(function () {
            console_cpu.append("<br><span class='cycle'>- Execução -</span>");
            operand_jump = opcode.substring(3, 16);
            var result = parseInt(operand_jump, 2);
            if (result >= 0 && result <= 4) {
                pc_count = parseInt(operand_jump, 2);
            } else {
                $("#progress-cpu").append("<br><span class='error'>Código de operando inválido.</span>");
            }
            // }, 500)
            break;

        case '101': // OPERAÇÃO ADD
            console_cpu.append("<br><span class='decoder'>Decodificador</span> identifica operação <strong>ADD</strong>");
            setTimeout(function() {
                console_cpu.append("<br><span class='cycle'>- Execução -</span>");
                console_cpu.append("<br><span class='alu'>ULA</span> recebe operador e operandos.");
                alu.value = " + ";
                var destination = decode_register(operand_r);
                if (destination != null) {
                    if (operand_id == 1) {
                        origin = decode_register(operand);
                        if (origin != null) {
                            destination.value = (parseInt(origin.value) + parseInt(destination.value));
                            console_cpu.append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe resultado da operação.");
                        } else {
                            console_cpu.append("<br><span class='error'>Código de operando inválido.</span>");
                        }
                    } else {
                        output.value = (operand + destination.value);
                        console_cpu.append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe resultado da operação.");
                    }
                } else {
                    console_cpu.append("<br><span class='error'>Código de operando inválido.</span>");
                }
            }, 1000);
            break;

        case '011': // OPERAÇÃO SUB
            console_cpu.append("<br><span class='decoder'>Decodificador</span> identifica operação <strong>SUB</strong>");
            setTimeout(function() {
                console_cpu.append("<br><span class='cycle'>- Execução -</span>");
                console_cpu.append("<br><span class='alu'>ULA</span> recebe operador e operandos.");
                alu.value = " - ";
                var destination = decode_register(operand_r);
                if (destination != null) {
                    if (operand_id == 1) {
                        var origin = decode_register(operand);
                        if (origin != null) {
                            destination.value = (parseInt(destination.value) - parseInt(origin.value));
                            console_cpu.append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe resultado da operação.");
                        } else {
                            console_cpu.append("<br><span class='error'>Código de operando inválido.</span>");
                        }
                    } else {
                        destination.value = (destination.value - operand);
                        console_cpu.append("<br>* Registrador <strong>" + registerBeingUsed + "</strong> recebe resultado da operação.");
                    }
                } else {
                    console_cpu.append("<br><span class='error'>Código de operando inválido.</span>");
                }
            }, 1000);
            break;

        case '111': // OPERAÇÃO HLT
            console_cpu.append("<br><span class='decoder'>Decodificador</span> identifica operação <strong>HLT</strong>");
            decoder.value = "HLT";
            console_cpu.append("<br><span class='cycle'>- Execução -</span>");
            stop_interval = true;
            break;
        default:
            console_cpu.append("<br><span class='error'>Código de operação inválido.</span>");
            break;
    }
}

function decode_register(value) {
    switch (value) {
        case "100001":
            registerBeingUsed = "A";
            return register_A;
        case "100010":
            registerBeingUsed = "B";
            return register_B;
        default:
            return null;
    }
}

function put_example() {
    var example = $("#examples").val();
    switch (example) {
        case "add":
            for (i in addresses) {
                addresses[i].value = "";
            }
            addresses[0].value = '0011000010000101';
            addresses[1].value = '0011000100001101';
            addresses[2].value = '1011000011100010';

            break;
        case "sub":
            for (i in addresses) {
                addresses[i].value = "";
            }
            addresses[0].value = '0011000010001111';
            addresses[1].value = '0011000100000101';
            addresses[2].value = '0111000011100010';

            break;
        case "jmp":
            for (i in addresses) {
                addresses[i].value = "";
            }
            addresses[0].value = '0011000010000111';
            addresses[1].value = '0011000010000101';
            addresses[2].value = '0011000100001101';
            addresses[3].value = '1000000000000000';
            addresses[4].value = '1011000011100010';

            break;
        case "and":
            for (i in addresses) {
                addresses[i].value = "";
            }
            addresses[0].value = '0011000010000100';
            addresses[1].value = '0011000100000111';
            addresses[2].value = '0001000011100010';

            break;
        case "or":
            for (i in addresses) {
                addresses[i].value = "";
            }
            addresses[0].value = '0011000010001010';
            addresses[1].value = '0011000100110';
            addresses[2].value = '0101000011100010';

            break;
        case "htl":
            for (i in addresses) {
                addresses[i].value = "";
            }
            addresses[0].value = '0011000010000111';
            addresses[1].value = '1110000000000000';
            addresses[2].value = '0011000100001101';
            break;
    }
    $("#start-cpu").tooltip('show');
}

$('#pause-cpu').on('click', function(e) {
    e.preventDefault();
    isPaused = true;
    $('#continue-cpu').attr("disabled", false);
    $('#pause-cpu').attr("disabled", true);
});
$('#continue-cpu').on('click', function(e) {
    e.preventDefault();
    isPaused = false;
    $('#continue-cpu').attr("disabled", true);
    $('#pause-cpu').attr("disabled", false);
});
$(function() {
    $('[data-toggle="tooltip"]').tooltip()
})

function clear_console() {
    console_cpu.empty();
}