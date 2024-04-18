const styles = {
    monthStyle: `
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    justify-content: end;
    `,
    dayStyle: `
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
`
}

const dates = [
    { monthName: 'Январь', monthIndex: "01", days: 31, unavaliableDates: [5,6] },
    { monthName: 'Февраль', monthIndex: "02", days: 28, unavaliableDates: [5,6] },
    { monthName: 'Март', monthIndex: "03", days: 31, unavaliableDates: [5,6] },
    { monthName: 'Апрель', monthIndex: "04", days: 30, unavaliableDates: [5,6] },
    { monthName: 'Май', monthIndex: "05", days: 31, unavaliableDates: [5,6] },
    { monthName: 'Июнь', monthIndex: "06", days: 30, unavaliableDates: [] },
    { monthName: 'Июль', monthIndex: "07", days: 31, unavaliableDates: [] },
    { monthName: 'Август', monthIndex: "08", days: 31, unavaliableDates: [] },
    { monthName: 'Сентябрь', monthIndex: "09", days: 30, unavaliableDates: []},
    { monthName: 'Октябрь', monthIndex: "10", days: 31, unavaliableDates: [] },
    { monthName: 'Ноябрь', monthIndex: "11", days: 30, unavaliableDates: [] },
    { monthName: 'Декабрь', monthIndex: "12", days: 31, unavaliableDates: [] }
];


class Calendar {
    constructor(parentElement, options) {
        this.parentElement = parentElement;
        this.wrapperElement = document.querySelector(`.${parentElement}`).querySelector(".swiper-wrapper");
        this.navigation = options.navigation;
        this.initialMonth = options.initialMonth || 1;
        this.currentMonthIndex = this.initialMonth;
        this.activeDay = options.activeDay || "01.01.2024";
        this.currentYear = 2023;
        this.yearsToCrate = 2;

        if (options.onCalendarChange) {
            this.onCalendarChange = options.onCalendarChange;
        };

        if (options.onDayClick) {
            this.onDayClick = options.onDayClick;
        };

        this.init();
    }

    init() {
        const monthes = this.createMonthes();

        this.wrapperElement.innerHTML = monthes;

        this.calendarSlider = new Swiper(`.${this.parentElement}`, {
            navigation: { ...this.navigation },
            initialSlide: this.initialMonth - 1
        })

        this.callendarSliderEventListeners();
        this.calendarWrapperClickEvent();
    }

    createMonthes() {
        const { monthStyle, dayStyle } = styles;

        let content = [];

        for (let i = 0; i < this.yearsToCrate; i++) {
            this.currentYear += i;

            content += dates.map(month => {
                let daysElements = "";

                for (let i = 1; i <= month.days; i++) {
                    // Current day data
                    const [currentDay, currentMonth, currentYear] = this.activeDay.split(".");

                    // Notations for new Date object to compare dates
                    let dayNotation = `${this.currentYear}-${month.monthIndex}-${i > 9 ? i : "0" + i}`
                    let currentDayNotation = `${currentYear}-${currentMonth}-${currentDay}`

                    let isPassedDate = false;

                    // Check if day is already passed
                    if (new Date(currentDayNotation) > new Date(dayNotation)) {
                        isPassedDate = true;
                    }

                    // Check if day is unavalible
                    month.unavaliableDates.forEach(dayIndex => {
                        if (i % 7 === 0 || i % 7 === dayIndex + 1) {
                            isPassedDate = true;
                        }
                    })

                    // Day Id creation
                    let dayId = `${i > 9 ? i : "0" + i}.${month.monthIndex}.${this.currentYear}`;

                    daysElements += `
                        <div class="month__day${this.activeDay === dayId ? " month__day-active" : ""} ${isPassedDate ? "unavaliableDate" : ""}" id="${dayId}" style="${dayStyle}">${i}</div>
                    `;
                }

                return `
                    <div class="swiper-slide monthSlide" style="${monthStyle}">
                        ${daysElements}
                    </div>
                `
            }).join("");
        }


        return content;
    }

    callendarSliderEventListeners() {
        this.calendarSlider.on("slideChange", () => {
            this.changeCurrentMonth(this.calendarSlider);

            if (this.onCalendarChange) {
                this.onCalendarChange(this.currentMonthIndex, this.currentYear);
            }
        })
    }

    calendarWrapperClickEvent() {
        this.onDayClick(this.activeDay)
        this.wrapperElement.addEventListener("click", e => {
            if (e.target.classList.contains("month__day")) {
                this.activeDay = e.target.id;
                this.onDayClick(this.activeDay)
            }
        })
    }

    changeCurrentMonth(sliderInstance) {
        if (sliderInstance.activeIndex >= 12) {
            this.currentMonthIndex = sliderInstance.activeIndex - 11;
        } else {
            this.currentMonthIndex = sliderInstance.activeIndex + 1;
        }

        if (sliderInstance.activeIndex > 11) {
            this.currentYear = 2024;
        } else if (sliderInstance.activeIndex > 22) {
            this.currentYear = 2025;
        } else {
            this.currentYear = 2023;
        }
    }


}

try {
    const calendar = new Calendar("Tarif__header-controls-callendar", {
        navigation: {
            prevEl: "#Tarif__header-controls-callendar-nextButton",
            nextEl: "#Tarif__header-controls-callendar-prevButton"
        },
        initialMonth: getCurrentDate().split(".")[1],
        activeDay: getCurrentDate(),
        onCalendarChange: changeDate,
        onDayClick: changeActiveDay
    });
}
catch {
    console.log("no calendar")
}

function getCurrentDate() {
    const currentDate = new Date();
  
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Note: Months are zero-based, so we add 1
    const year = currentDate.getFullYear();
  
    const formattedDate = `${day}.${month}.${year}`;
  
    return formattedDate;
}

function changeDate(monthIndex, year) {
    const monthEl = document.querySelector(".Tarif__header-controls-callendar-top-title span");
    monthEl.textContent = `${dates[monthIndex - 1].monthName} ${year}`;
}

function changeActiveDay(activeDayId) {
    const allDays = document.querySelectorAll(".month__day");
    const activeDayEl = document.getElementById(`${activeDayId}`);

    allDays.forEach(day => day.classList.remove("month__day-active"));
    activeDayEl.classList.add("month__day-active");

    displayActiveDay(activeDayId);
}

function displayActiveDay(activeDayId) {
    const dateEl = document.querySelector("#Tarif__header-controls-date-title span");
    const monthes = [
        { index: "01", genitive: "января" },
        { index: "02", genitive: "февраля" },
        { index: "03", genitive: "марта" },
        { index: "04", genitive: "апреля" },
        { index: "05", genitive: "мая" },
        { index: "06", genitive: "июня" },
        { index: "07", genitive: "июля" },
        { index: "08", genitive: "августа" },
        { index: "09", genitive: "сентября" },
        { index: "10", genitive: "октября" },
        { index: "11", genitive: "ноября" },
        { index: "12", genitive: "декабря" }
    ];
    // Август__11
    let currentMonth;
    for (let month of monthes) {
        if (month.index === activeDayId.split(".")[1]) {
            currentMonth = month.genitive;
        }
    }
    const currentDay = activeDayId.split(".")[0] > 9 ? activeDayId.split(".")[0] : activeDayId.split(".")[0].slice(1);
    const currentYear = activeDayId.split(".")[2];

    dateEl.textContent = `${currentDay} ${currentMonth} ${currentYear}`;
}