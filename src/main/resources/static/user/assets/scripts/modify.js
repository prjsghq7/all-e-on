const $modifyForm = document.getElementById('modifyForm');

$modifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const $nicknameLabel = $modifyForm['nickname'].closest('[data-aeo-object="label"]');
    const $birthLabel = $modifyForm['birth'].closest('[data-aeo-object="label"]');
    const $contactLabel = $modifyForm['contactSecond'].closest('[data-aeo-object="label"]');
    const $addressLabel = $modifyForm['addressPostal'].closest('[data-aeo-object="label"]');
    const $houseCodeLabel = $modifyForm['houseCode'].closest('[data-aeo-object="label"]');
    const $interestCodeLabel = $modifyForm['interestCode'].closest('[data-aeo-object="label"]');
    const $lifeCodeLabel = $modifyForm['lifeCode'].closest('[data-aeo-object="label"]');

    const $labels = [$nicknameLabel, $birthLabel, $contactLabel, $addressLabel, $houseCodeLabel, $interestCodeLabel, $lifeCodeLabel];
    $labels.forEach(($label) => {
        $label.setInValid(false);
    });

    if (!$modifyForm['nicknameCheckButton'].hasAttribute('disabled')) {
        $nicknameLabel.setInValid(true, '닉네임 중복 확인해 주세요.');
    }
    if (!$modifyForm['contactCheckButton'].hasAttribute('disabled')) {
        $contactLabel.setInValid(true, '연락처 중복 확인해 주세요.');
    }

    if ($modifyForm['birth'].validity.valueMissing) {
        $birthLabel.setInValid(true, '생년월일을 입력해 주세요.');
    } else if (!$modifyForm['birth'].validity.valid) {
        $birthLabel.setInValid(true, '올바른 생년월일을 입력해 주세요.');
    }

    if ($modifyForm['addressPostal'].value.trim() === ''
        || $modifyForm['addressPrimary'].value.trim() === '') {
        $addressLabel.setInValid(true, '주소 찾기 버튼을 통해 주소를 입력해 주세요.');
    } else if ($modifyForm['addressSecondary'].validity.valueMissing) {
        $addressLabel.setInValid(true, '상세 주소를 입력해 주세요.');
    }

    if ($modifyForm['houseCode'].value === '') {
        $houseCodeLabel.setInValid(true, '관심 카테고리를 선택해 주세요.');
    }
    if ($labels.some($label => $label.isInValid())) {
        return;
    }
});
