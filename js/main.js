let banks = JSON.parse(localStorage.getItem("banks")) || [];

function update() {
    localStorage.setItem("banks", JSON.stringify(banks));
}

$("#calculate").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    let bank = banks[parseInt(allBanks.value)];
    let loan = parseInt(inLoan.value);
    let proposedDownPayment = parseInt(inDownPayment.value);
    let calculatedDownPayment = parseInt((loan * bank.downPayment) / 100);
    let monthly = (
        ((loan-proposedDownPayment) *
            (bank.rate / 1200) *
            (1 + bank.rate / 1200) ** (12 * bank.term)) /
            ((1 + bank.rate / 1200) ** (12 * bank.term) - 1)
    ).toFixed(2);

    if (bank.loan < loan) {
        $("#result").text("Loan is too large for current bank!");
        return;
    }
    if (calculatedDownPayment > proposedDownPayment) {
        $("#result").text(
            "Proposed down payment is too small for current bank!"
        );
        return;
    }
    $("#result").text(monthly);
});

$("#switch").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).css("display", "none");
    $("#cardRedactor").css("display", "flex");
});

$("#create").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (
        !(
            bankname.value != "" &&
            rate.value != "" &&
            loan.value != "" &&
            downPayment.value != "" &&
            term.value != ""
        )
    ) {
        return;
    }
    let bank = {
        bankname: bankname.value,
        rate: rate.value,
        loan: loan.value,
        downPayment: downPayment.value,
        term: term.value,
    };
    banks.push(bank);
    update();
    add(bank);
    $("#cardRedactor").css("display", "none");
    $("#switch").css("display", "flex");
    $("#cardRedactor input").val("");
});

function addAll() {
    for (let index = 0; index < banks.length; index++) {
        add(banks[index]);
    }
}

function add(bank) {
    let el = `
    <div class="card">
    <div class="card__span">
    <div class="span__title">Bank's name: </div>
    <input class="card__input input__string" type="text" name="bankname" value="${bank.bankname}" disabled>
</div>
<div class="card__span">
    <div class="span__title">Bank's Interest(%): </div>
    <input class="card__input input__dec" type="text" name="rate" value="${bank.rate}" disabled>
</div>
<div class="card__span">
    <div class="span__title">Bank's max loan:</div>
    <input type="text" class="card__input input__dec" name="loan" value="${bank.loan}" disabled>
</div>
<div class="card__span">
    <div class="span__title">Bank's down payment(%): </div>
    <input type="text" class="card__input input__dec" name="downPayment" value="${bank.downPayment}" disabled>
</div>
<div class="card__span">
    <div class="span__title">Bank's term(yrs.):</div>
    <input type="text" class="card__input input__dec" name="term" value="${bank.term}" disabled>
</div>
    </div>
`;
    $("#addCard").after(
        $(el)
            .append(
                $(`
                <div class="card__del" id="del">
                    <img src="images/delete.svg" alt="#">
                </div>
            `).on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                
                    let ind = banks.length - $(this).parent().index();
                    $(this).parent().remove();
                    banks.splice(ind, 1);
                    update();
                })
            )
            .append(
                $(`
                <div class="card__redact" id="redact">
                    <img src="images/pencil.svg" alt="#">
                </div>
             `).on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(this).siblings(".card__span").children('input').removeAttr("disabled");
                    $(this).siblings("#saveCard").removeAttr("disabled")
                })
            )
            .append(
                $(`
                <button id="saveCard" disabled>save</button>
             `).on("click", function (e) {
                    let isValid = true;
                    e.preventDefault();
                    e.stopPropagation();
                    let ind = banks.length - $(this).parent().index();
                    let bank = {};
                    $(this)
                        .siblings(".card__span").children("input")
                        .each(function () {
                            if ($(this).val() == "") {
                                isValid = false;
                            }
                            bank[$(this).attr("name")] = $(this).val();
                        });
                    if (!isValid) {
                        return;
                    }
                    banks[ind] = bank;
                    $(this)
                    .siblings(".card__span").children("input")
                        .attr("disabled", "disabled")
                    
                    $(this).attr("disabled", "disabled")
                    update();
                })
            )
            .children(".card__span").children('.input__string')
            .on("input", function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).val(
                    $(this)
                        .val()
                        .replace(/[^a-zA-Zа-яА-ЯйЙїЇєЄіІгГґҐ\s]+/g, "")
                );
            }).parent().parent()
            .children('.card__span').children('.input__dec')
            .on("input", function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).val(
                    $(this)
                        .val()
                        .replace(/[^\d]+/g, "")
                );
            }).parent().parent()
    );
}

$("input.input__string").on("input", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).val(
        $(this)
            .val()
            .replace(/[^a-zA-Zа-яА-ЯйЙїЇєЄіІгГґҐ\s]+/g, "")
    );
});

$("input.input__dec").on("input", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).val(
        $(this)
            .val()
            .replace(/[^\d]+/g, "")
    );
});

window.addEventListener("hashchange", function (e) {
    normalizeHash();
});

$(document).ready(() => {
    addAll();
    normalizeHash();
    updateCalculator();
});

function normalizeHash() {
    switch (window.location.hash) {
        case "#home":
            $(".container.cards").css("display", "flex");
            $(".container.calculator").css("display", "none");
            break;
        case "#calculator":
            $(".container.cards").css("display", "none");
            $(".container.calculator").css("display", "flex");
            updateCalculator()
            break;
        default:
            window.location.hash = "#home";
    }
}

function updateCalculator(){
    $(".calculator__inputs").children('input').val('')
    $("#allBanks").children("option:not(.option__default)").remove();
    for (let i = banks.length - 1; i > -1; i--) {
        let bank = banks[i];
        $("#allBanks").append(
            $(
                `<option class="option__bank" value="${i}">${bank.bankname}</option>`
            )
        );
    }
}
